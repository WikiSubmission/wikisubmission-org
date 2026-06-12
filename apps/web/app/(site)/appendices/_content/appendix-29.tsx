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
          &ldquo;In the name of God, Most Gracious, Most Merciful.&rdquo; — present in every
          sura except Sura 9, and appearing twice in Sura 27.
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="27:30" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Every sura in the Quran opens with the statement &ldquo;In the name of God, Most
          Gracious, Most Merciful,&rdquo; known as the <em>Basmalah</em>, with the exception
          of Sura 9. This conspicuous absence of the <em>Basmalah</em> from Sura 9 has been an
          intriguing feature of the Quran for 14 centuries. Many theories have been advanced to
          explain this phenomenon.
        </p>
        <p>
          Now we learn that the missing <em>Basmalah</em> plays a significant role as (1) a
          significant constituent of the Quran&apos;s mathematical miracle, and (2) a glaring
          sign from the Most Gracious that Sura 9 has been tampered with and must be purified
          (
          <Link href="/appendices/24">Appendix 24</Link>). Both roles were revealed with the
          discovery of the Quran&apos;s mathematical code.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Twelve Miraculous Features
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          [1] Since the <em>Basmalah</em> consists of 19 Arabic letters, and prefixes all the
          suras except one, it can be considered the foundation of the Quran&apos;s 19-based
          code. The absence of the <em>Basmalah</em> from Sura 9 causes the number of this
          crucial opening statement to be 113, which does not conform with the code. However,
          this deficiency is compensated for in Sura 27, where two <em>Basmalah</em>s occur —
          one as an opener and one in Verse 30. This restores the total number of{' '}
          <em>Basmalah</em>s in the Quran to 114&nbsp;=&nbsp;19&times;6.
        </p>
        <p>
          [2] From the missing <em>Basmalah</em> of Sura 9 to the extra <em>Basmalah</em> of
          Sura 27, there are exactly 19 suras.
        </p>
        <p>
          [3] The sum of sura numbers from the missing <em>Basmalah</em> (Sura 9) to the extra{' '}
          <em>Basmalah</em> (Sura 27) is 9+10+11+…+27&nbsp;=&nbsp;342&nbsp;=&nbsp;19&times;18.
          This equals the number of words from the first <em>Basmalah</em> of Sura 27 to the
          second <em>Basmalah</em> in <QuranRef reference="27:30" />.
        </p>
        <p>
          [4] The occurrence of the extra <em>Basmalah</em> in <QuranRef reference="27:30" />{' '}
          conforms with the Quran&apos;s code: the sura number plus the verse number is a
          multiple of 19 (27+30&nbsp;=&nbsp;57&nbsp;=&nbsp;19&times;3).
        </p>
        <p>
          [5] The occurrence of the extra <em>Basmalah</em> in Verse 30 compares with the
          occurrence of the number 19 itself in Verse 30 of Sura 74.
        </p>
        <p>
          [6] The Quran contains 6234 numbered verses. The absence of the <em>Basmalah</em>{' '}
          from Sura 9, and its compensation in Verse 30 of Sura 27, gives us two numbered{' '}
          <em>Basmalah</em>s (<QuranRef reference="1:1" /> &amp; <QuranRef reference="27:30" />)
          and 112 un-numbered <em>Basmalah</em>s. The total number of verses becomes
          6234+112&nbsp;=&nbsp;6346&nbsp;=&nbsp;19&times;334.
        </p>
        <p>
          [7] From the missing <em>Basmalah</em> to the extra <em>Basmalah</em>, the number of
          verses containing the word &ldquo;Allah&rdquo; is 513&nbsp;=&nbsp;19&times;27. Note
          that 27 is the sura number where the extra <em>Basmalah</em> occurs (Table 1).
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Table 1: Verses Containing &ldquo;Allah&rdquo; — Suras 9 to 27
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-border/40 px-3 py-2 text-left">Sura Number</th>
              <th className="border border-border/40 px-3 py-2 text-left">Verses with &ldquo;Allah&rdquo;</th>
            </tr>
          </thead>
          <tbody>
            {[
              [9,100],[10,49],[11,33],[12,34],[13,23],[14,28],[15,2],[16,64],[17,10],
              [18,14],[19,8],[20,6],[21,5],[22,50],[23,12],[24,50],[25,6],[26,13],[27,6],
            ].map(([sura, count]) => (
              <tr key={sura}>
                <td className="border border-border/40 px-3 py-2 text-left">{sura}</td>
                <td className="border border-border/40 px-3 py-2 text-left">{count}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="border border-border/40 px-3 py-2 text-left">342 (19×18)</td>
              <td className="border border-border/40 px-3 py-2 text-left">513 (19×27)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          [8] The sum of verse numbers (1+2+3+…+n), plus the number of verses, from the missing{' '}
          <em>Basmalah</em> to the extra <em>Basmalah</em> is
          119,624&nbsp;=&nbsp;19&times;6296 (Table 2).
        </p>
        <p>
          [9] This item also proves that Sura 9 consists of 127 verses, not 129 (see{' '}
          <Link href="/appendices/24">Appendix 24</Link>). The sum of digits of 127 is
          1+2+7=10. By finding all the verses whose digits add up to 10, from the missing{' '}
          <em>Basmalah</em> of Sura 9 to the extra <em>Basmalah</em> of Sura 27, then adding
          the number of these verses to the total number of verses from the missing{' '}
          <em>Basmalah</em> to the extra <em>Basmalah</em>, we get
          2128&nbsp;=&nbsp;19&times;112 (Table 3).
        </p>
        <p>
          [10] Sura 9 is an odd-numbered sura whose number of verses (127) is also odd. From
          the missing <em>Basmalah</em> to the extra <em>Basmalah</em>, there are 7 suras
          that possess this property: Suras 9, 11, 13, 15, 17, 25, and 27. By adding the
          digits that make up the sura numbers and the numbers of verses, the grand total is
          114&nbsp;=&nbsp;19&times;6 (Table 4).
        </p>
        <p>
          [11] If we take the same suras listed in Table 4 and write down the number of every
          sura, followed by its number of verses, the resulting long number (30 digits) is a
          multiple of 19:
        </p>
      </section>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm font-mono">
        <p className="text-center">9&nbsp;127&nbsp;&nbsp;11&nbsp;123&nbsp;&nbsp;13&nbsp;43&nbsp;&nbsp;15&nbsp;99&nbsp;&nbsp;17&nbsp;111&nbsp;&nbsp;25&nbsp;77&nbsp;&nbsp;27&nbsp;29</p>
        <p className="text-xs text-muted-foreground text-center">
          Every sura number is followed by the number of verses in that sura.
          <br />
          This long number = 19 × 48037427533385052195322409091
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          [12] If we write down the number of every sura, followed by the last digit in every
          verse in that sura, we end up with a long number of 1988 digits which is divisible
          by 19.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Table 2: Suras &amp; Verses — Missing Basmalah to Extra Basmalah
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-border/40 px-3 py-2 text-left">Sura</th>
              <th className="border border-border/40 px-3 py-2 text-left">Verses</th>
              <th className="border border-border/40 px-3 py-2 text-left">Sum of Verse #</th>
            </tr>
          </thead>
          <tbody>
            {[
              [9,127,8128],[10,109,5995],[11,123,7626],[12,111,6216],[13,43,946],
              [14,52,1378],[15,99,4950],[16,128,8256],[17,111,6216],[18,110,6105],
              [19,98,4851],[20,135,9180],[21,112,6328],[22,78,3081],[23,118,7021],
              [24,64,2080],[25,77,3003],[26,227,25878],[27,29,435],
            ].map(([sura, verses, sum]) => (
              <tr key={sura}>
                <td className="border border-border/40 px-3 py-2 text-left">{sura}</td>
                <td className="border border-border/40 px-3 py-2 text-left">{verses}</td>
                <td className="border border-border/40 px-3 py-2 text-left">{sum.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="border border-border/40 px-3 py-2 text-left">342</td>
              <td className="border border-border/40 px-3 py-2 text-left">1951</td>
              <td className="border border-border/40 px-3 py-2 text-left">117,673</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground">342 + 1951 + 117,673 = 119,624 = 19 × 6296</p>
      </div>
    </>
  )
}
