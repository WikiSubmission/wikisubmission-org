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
          &ldquo;God took a covenant from the prophets, saying, &lsquo;I will give you the
          scripture and wisdom. Afterwards, a messenger will come to confirm all existing
          scriptures. You shall believe in him and support him.&rsquo;&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="3:81" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This appendix provides the Quranic mathematical evidence that (1) Abraham was
          the original messenger of Islam, i.e., Submission (<QuranRef reference="22:78" />
          ), (2) Muhammad was the scripture-delivering messenger (<QuranRef reference="47:2" />
          ), and (3) Rashad is the purifying and consolidating messenger who delivered the
          religion&apos;s authenticating proof (<QuranRef reference="3:81" /> &amp;{' '}
          <Link href="/appendices/2">Appendix 2</Link>).
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Perpetual and Verifiable Evidence
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          [1] As pointed out in <Link href="/appendices/2">Appendix 2</Link>, the gematrical
          value of &ldquo;Abraham&rdquo; is 258, the gematrical value of &ldquo;Muhammad&rdquo;
          is 92, the gematrical value of &ldquo;Rashad&rdquo; is 505, and
          258+92+505&nbsp;=&nbsp;855&nbsp;=&nbsp;19&times;45.
        </p>
        <p>
          [2] If we include &ldquo;Ismail,&rdquo; whose gematrical value is 211, and
          &ldquo;Isaac,&rdquo; whose gematrical value is 169, we still end up with a total
          gematrical value of 855+211+169&nbsp;=&nbsp;1235&nbsp;=&nbsp;19&times;65. The total
          gematrical value of the three messengers, or the five, cannot conform with the
          Quran&apos;s 19-based mathematical code if either Abraham, Muhammad, or Rashad is not
          included.
        </p>
        <p>
          [3] The first and last occurrences of &ldquo;Abraham&rdquo; are in{' '}
          <QuranRef reference="2:124" /> and <QuranRef reference="87:19" />. By adding the sura
          numbers, plus the number of verses, plus the sum of verse numbers from the first
          occurrence to the last occurrence, the grand total is 333,260&nbsp;=&nbsp;19&times;17540
          (Table 1).
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Table 1: Suras &amp; Verses — First to Last Occurrence of Abraham
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-border/40 px-3 py-2 text-left">Sura No.</th>
              <th className="border border-border/40 px-3 py-2 text-left">No. of Verses</th>
              <th className="border border-border/40 px-3 py-2 text-left">Sum of Verse #s</th>
              <th className="border border-border/40 px-3 py-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-border/40 px-3 py-2 text-left">2</td><td className="border border-border/40 px-3 py-2 text-left">163</td><td className="border border-border/40 px-3 py-2 text-left">33415</td><td className="border border-border/40 px-3 py-2 text-left">33580</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">3</td><td className="border border-border/40 px-3 py-2 text-left">200</td><td className="border border-border/40 px-3 py-2 text-left">20100</td><td className="border border-border/40 px-3 py-2 text-left">20303</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">4</td><td className="border border-border/40 px-3 py-2 text-left">176</td><td className="border border-border/40 px-3 py-2 text-left">15576</td><td className="border border-border/40 px-3 py-2 text-left">15756</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">5</td><td className="border border-border/40 px-3 py-2 text-left">120</td><td className="border border-border/40 px-3 py-2 text-left">7260</td><td className="border border-border/40 px-3 py-2 text-left">7385</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">…</td><td className="border border-border/40 px-3 py-2 text-left">…</td><td className="border border-border/40 px-3 py-2 text-left">…</td><td className="border border-border/40 px-3 py-2 text-left">…</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">9</td><td className="border border-border/40 px-3 py-2 text-left">127</td><td className="border border-border/40 px-3 py-2 text-left">8128</td><td className="border border-border/40 px-3 py-2 text-left">8264</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">…</td><td className="border border-border/40 px-3 py-2 text-left">…</td><td className="border border-border/40 px-3 py-2 text-left">…</td><td className="border border-border/40 px-3 py-2 text-left">…</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">84</td><td className="border border-border/40 px-3 py-2 text-left">25</td><td className="border border-border/40 px-3 py-2 text-left">325</td><td className="border border-border/40 px-3 py-2 text-left">434</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">85</td><td className="border border-border/40 px-3 py-2 text-left">22</td><td className="border border-border/40 px-3 py-2 text-left">253</td><td className="border border-border/40 px-3 py-2 text-left">360</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">86</td><td className="border border-border/40 px-3 py-2 text-left">17</td><td className="border border-border/40 px-3 py-2 text-left">153</td><td className="border border-border/40 px-3 py-2 text-left">256</td></tr>
            <tr><td className="border border-border/40 px-3 py-2 text-left">87</td><td className="border border-border/40 px-3 py-2 text-left">19</td><td className="border border-border/40 px-3 py-2 text-left">190</td><td className="border border-border/40 px-3 py-2 text-left">296</td></tr>
            <tr className="font-semibold">
              <td className="border border-border/40 px-3 py-2 text-left">3827</td>
              <td className="border border-border/40 px-3 py-2 text-left">5835</td>
              <td className="border border-border/40 px-3 py-2 text-left">323598</td>
              <td className="border border-border/40 px-3 py-2 text-left">333260 (19×17540)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          [4] As pointed out in <Link href="/appendices/2">Appendix 2</Link>, the name of
          God&apos;s Messenger of the Covenant is introduced to the computer age through
          mathematical coding. If the name was specified in the Quran, as is the case with
          past messengers, millions of people would have named their children
          &ldquo;Rashad Khalifa.&rdquo; Thus, the root word &ldquo;Rashada&rdquo; is mentioned
          in the Quran 19 times (<Link href="/appendices/2">Appendix 2</Link>).
        </p>
        <p>
          [5] &ldquo;Abraham&rdquo; is mentioned in 25 suras, &ldquo;Muhammad&rdquo; is
          mentioned in 4 suras, and &ldquo;Rashada&rdquo; occurs in 9 suras. The total of
          these suras is 25+4+9&nbsp;=&nbsp;38&nbsp;=&nbsp;19&times;2.
        </p>
        <p>
          [6] If we add the numbers of the suras where Abraham, Muhammad, and Rashada occur,
          plus the number of occurrences per sura, the total comes to
          1083&nbsp;=&nbsp;19&times;19&times;3 (Table 2).
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Table 2: Suras &amp; Occurrences of Abraham, Muhammad, and Rashada
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-border/40 px-3 py-2 text-left">Sura No.</th>
              <th className="border border-border/40 px-3 py-2 text-left">Abraham</th>
              <th className="border border-border/40 px-3 py-2 text-left">Muhammad</th>
              <th className="border border-border/40 px-3 py-2 text-left">Rashada</th>
            </tr>
          </thead>
          <tbody>
            {[
              [2,15,'-',2],[3,7,1,'-'],[4,4,'-',1],[6,4,'-','-'],[7,'-','-',1],
              [9,3,'-','-'],[11,4,'-',3],[12,2,'-','-'],[14,1,'-','-'],[15,1,'-','-'],
              [16,2,'-','-'],[18,'-','-',4],[19,3,'-','-'],[21,4,'-',1],[22,3,'-','-'],
              [26,1,'-','-'],[29,2,'-','-'],[33,1,1,'-'],[37,3,'-','-'],[38,1,'-','-'],
              [40,'-','-',2],[42,1,'-','-'],[43,1,'-','-'],[47,'-',1,'-'],[48,'-',1,'-'],
              [49,'-','-',1],[51,1,'-','-'],[53,1,'-','-'],[57,1,'-','-'],[60,2,'-','-'],
              [72,'-','-',4],[87,1,'-','-'],
            ].map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-border/40 px-3 py-2 text-left">{cell}</td>
                ))}
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="border border-border/40 px-3 py-2 text-left">991</td>
              <td className="border border-border/40 px-3 py-2 text-left">69</td>
              <td className="border border-border/40 px-3 py-2 text-left">4</td>
              <td className="border border-border/40 px-3 py-2 text-left">19</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground">
          991+69+4+19 = 1083 = 19×19×3 (the 3 messengers). &ldquo;Rashada&rdquo; occurs 19 times.
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          [7] If we take all the suras where Abraham, Muhammad, and the root word
          &ldquo;Rashada&rdquo; are mentioned, and add the sura numbers, plus the number of the
          first verse in each sura where each of the three words is mentioned, the total comes
          to 2793&nbsp;=&nbsp;19&times;147 (Table 3).
        </p>
        <p>
          [8] The sum of all sura numbers where the three words occur, without repetition,
          plus the sum of all the verse numbers, without repetition, add up to
          6479&nbsp;=&nbsp;19&times;341. The sum of sura numbers is 991 (see Table 3). The sum
          of verse numbers is 5488, and: 5488+991&nbsp;=&nbsp;6479&nbsp;=&nbsp;19&times;341.
        </p>
        <p>
          [9] If we add the sura number, plus the verse number, plus the number of verses
          where Abraham, Muhammad, and Rashada occur, we get a grand total that equals
          7505&nbsp;=&nbsp;19&times;395 (Table 4).
        </p>
        <p>
          [10] As shown in Table 4, the 19 occurrences of the root word &ldquo;Rashada&rdquo;
          are in verses 186, 256, 6, 146, 78, 87, 97, 10, 17, 24, 66, 51, 29, 38, 7, 2, 10,
          14, and 21. These are 38 digits&nbsp;=&nbsp;19&times;2.
        </p>
        <p>
          [11] Table 4 shows that the sum of the verse numbers where we see the 19 occurrences
          of the root word &ldquo;Rashada&rdquo; is 1145. By adding this total (1145) to the
          gematrical value of &ldquo;Rashad&rdquo; (505), plus the gematrical value of
          &ldquo;Khalifa&rdquo; (725), we get
          1145+505+725&nbsp;=&nbsp;2375&nbsp;=&nbsp;19&times;125.
        </p>
        <p>
          [12] If we write down these numbers next to each other — 1145, 505, 725 — we also get
          a number that is a multiple of 19: 1145505725&nbsp;=&nbsp;19&times;60289775.
        </p>
      </section>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2 text-sm text-center font-mono">
        <p>Sum of Verse Numbers Where the 19 &ldquo;Rashada&rdquo; Occur = 1145</p>
        <p>Gematrical Value of the Name &ldquo;Rashad&rdquo; = 505</p>
        <p>Gematrical Value of the Name &ldquo;Khalifa&rdquo; = 725</p>
        <p className="font-bold text-base pt-2">1145 + 505 + 725 = 2375 = 19 × 125</p>
        <p className="font-bold text-base">1145&nbsp;505&nbsp;725 = 1145505725 = 19 × 60289775</p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Thus, it is mathematically coded into the Quran that Abraham, Muhammad, and Rashad
          are the three messengers of Islam (Submission).
        </p>
      </section>
    </>
  )
}
