import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'

export function AppendixContent() {
  return (
    <>
      {/* ── Opening cards ─────────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4"
      >
        <p className="text-sm leading-relaxed italic text-foreground/90">
          A superhuman mathematical system pervades the Quran and serves to guard
          and authenticate every element in it. Nineteen years after the
          Prophet&apos;s death, some scribes injected two false verses at the end of
          Sura 9, the last sura revealed in Medina. The evidence presented in this
          Appendix incontrovertibly removes these human injections, restores the
          Quran to its pristine purity, and illustrates a major function of the
          Quran&apos;s mathematical code, namely, to protect the Quran from the
          slightest tampering. Thus, the code rejects ONLY the false injections
          9:128-129.
        </p>
        <div className="border-t border-border/40 pt-4">
          <p className="text-sm leading-relaxed italic text-foreground/90">
            &ldquo;Surely, we have revealed this scripture, and surely, we will
            preserve it.&rdquo;
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            <QuranRef reference="15:9" />
          </p>
        </div>
      </div>

      {/* ── Historical Background ─────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran is God&apos;s Final Testament. Hence the divine pledge to keep it
          perfectly preserved. To assure us of both the divine authorship, and the
          perfect preservation of the Quran, the Almighty author has rendered the
          Quran mathematically composed. As proven by the physical evidence in{' '}
          <Link href="/appendices/1" className="text-primary underline underline-offset-2">
            Appendix 1
          </Link>
          , such mathematical composition is far beyond human capabilities. The
          slightest violation of God&apos;s Final Testament is destined to stand out
          in glaring disharmony. A deviation by only 1 — one sura, one verse, one
          word, even one letter — is immediately exposed.
        </p>
        <p>
          Nineteen years after the Prophet Muhammad&apos;s death, during the reign of
          Khalifa &lsquo;Uthman, a committee of scribes was appointed to make several
          copies of the Quran to be dispatched to the new Muslim lands. The copies
          were to be made from the original Quran which was written by
          Muhammad&apos;s hand (
          <Link href="/appendices/28" className="text-primary underline underline-offset-2">
            Appendix 28
          </Link>
          ).
        </p>
        <p>
          This committee was supervised by &lsquo;Uthman Ibn &lsquo;Affaan, &lsquo;Ali
          Ibn Abi Taaleb, Zeid Ibn Thaabet, Ubayy Ibn Ka&apos;ab, &lsquo;Abdullah
          Ibn Al-Zubair, Sa&apos;eed Ibn Al-&lsquo;Aas, and &lsquo;Abdul Rahman Ibn
          Al-Haareth Ibn Heshaam. The Prophet had written the Quran in its
          chronological order of revelation (
          <Link href="/appendices/23" className="text-primary underline underline-offset-2">
            Appendix 23
          </Link>
          ), together with the necessary instructions to place every piece in its
          proper position. The last sura revealed in Medina was Sura 9. Only Sura
          110, a very short sura, was revealed after Sura 9, in Mina.
        </p>
        <p>
          The committee of scribes finally came to Sura 9, and put it in its proper
          place. One of the scribes suggested adding a couple of verses to honor the
          Prophet. The majority of scribes agreed. &lsquo;Ali was outraged. He
          vehemently maintained that the word of God, written down by the hand of His
          final prophet, must never be altered.
        </p>
        <p>
          &lsquo;Ali&apos;s protest is documented in many references, including the
          classic reference <em>Al Itqaan Fee &lsquo;Ulum Al Quran</em> by
          Jalaluddin Al-Suyuty (Al-Azhareyyah Press, Cairo, Egypt, 1318 AH, Page 59):
        </p>
      </section>

      {/* ── Ali's Protest ─────────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-border/60 p-5 text-sm italic text-foreground/80 leading-relaxed"
      >
        &ldquo;&lsquo;Ali was asked: &lsquo;Why are you staying home?&rsquo; He said,
        &lsquo;Something has been added to the Quran, and I have pledged never to put
        on my street clothes, except for the prayer, until the Quran is
        restored.&rsquo;&rdquo;
        <p className="text-xs not-italic text-muted-foreground font-mono mt-2">
          [Al-Suyuty&apos;s Famous Reference: Itqaan]
        </p>
      </div>

      {/* ── Consequences ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Horrendous Consequences
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-4 text-base leading-relaxed text-foreground/90">
        <p>The horrendous dimensions of this crime can be realized once we look at the consequences:</p>
        <ul className="space-y-2">
          {[
            '`Uthman was assassinated, and `Ali was installed as the fourth Khalifa.',
            'A 50-year war erupted between the new Khalifa and his supporters on one side, and the Mohammedan distorters of the Quran on the other side.',
            '`Ali was martyred, and eventually his family, the prophet Muhammad\'s family, except for some women and children, were killed.',
            'The disaster culminated in the infamous Battle of Karbala, where `Ali\'s son, Hussein, and his family were massacred.',
            'The Muslims were deprived of the pure, unaltered, Quran for 1400 years.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-destructive/10 text-destructive font-mono text-xs font-semibold mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The distorters of the Quran finally won the war, and the &ldquo;official&rdquo;
          history that came to us represented the victors&apos; point of view. This
          apparent victory for God&apos;s enemies was, of course, in accordance with
          God&apos;s will. In just two decades after the Prophet&apos;s death, the
          idol worshipers who were defeated by the Prophet in the conquest of Mecca
          (632 AD) reverted to idolatry. Ironically, this time around their idol was
          the Prophet himself.
        </p>
        <p>
          The first peace time ruler after this lengthy and disastrous war was Marwan
          Ibn Al Hakam (died 65 AH/684 AD). One of the first duties he performed was
          to destroy the original Quran — the one that was scrupulously written by
          the Prophet&apos;s own hand — &ldquo;fearing it might become the cause of
          NEW disputes.&rdquo; The question an intelligent person must ask is: &ldquo;If
          the original Quran were identical to the Quran in circulation at that time,
          why did Marwan Ibn Al-Hakam have to destroy it?!&rdquo;
        </p>
        <p>
          Upon examining the oldest Islamic references, we realize that the false
          injections, 9:128-129, were always suspect. Every single verse in the Quran
          was verified by a multiplicity of witnesses &ldquo;except Verses 128 and
          129 of Sura 9; they were found only with Khuzeimah Ibn Thaabet
          Al-Ansaary.&rdquo; When some people questioned this improper exception,
          someone came up with a Hadith stating that &ldquo;the testimony of Khuzeimah
          equals the testimony of two men!!!&rdquo;
        </p>
        <p>
          Strangely, the false injections 9:128-129 are labeled in the traditional
          Quran printings as &ldquo;Meccan,&rdquo; even though Sura 9 is a Medinan
          sura. How could these &ldquo;Meccan&rdquo; verses be found with Khuzeimah,
          a late &ldquo;Medinan&rdquo; Muslim?! How could a Medinan sura contain
          Meccan verses, when the universal convention has been to label as
          &ldquo;Medinan&rdquo; all revelations after the Prophet&apos;s Hijerah from
          Mecca?
        </p>
      </section>

      {/* ── Translation of False Verses ───────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-2 text-sm"
      >
        <p className="font-semibold text-destructive/80 uppercase tracking-widest text-xs">
          The Two False Verses (9:128-129) — Translation
        </p>
        <p className="italic text-foreground/80 leading-relaxed">
          &ldquo;A messenger has come to you from among you who wants no hardship to
          afflict you, and cares about you, and is compassionate towards the
          believers, merciful. If they turn away, then say, &lsquo;Sufficient for me
          is God, there is no god except He. I put my trust in Him. He is the Lord
          with the great throne.&rsquo;&rdquo;
        </p>
      </div>

      {/* ── The Physical Evidence ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Physical Evidence
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-4 text-base leading-relaxed text-foreground/90">
        {[
          'The first violation of the Quran\'s code by Verses 9:128-129 appeared when the count of the word "God" (Allah) in the Quran was found to be 2699, which is not a multiple of 19, unless we remove one. The correct total is 2698, or 19×142, because the false injections 9:128-129 have been removed.',
          'The sum of all the verse numbers where the word "God" occurs is 118123, or 19×6217. If the false Verse 9:129 is included, this phenomenon disappears.',
          'The total occurrence of the word "God" to the end of Sura 9 is 1273, or 19×67. If the false injections 9:128-129 were included, the total would become 1274, not a multiple of 19.',
          'The occurrence of the word "God" from the first Quranic initial ("A.L.M." of 2:1) to the last initial ("N." of 68:1) totals 2641, or 19×139. If the human injections 9:128 and 129 were included, the count would become 2642, not a multiple of 19.',
          'Sura 9 is an un-initialed sura. The word "God" occurs in 57 of the 85 un-initialed suras, which is 19×3. The total number of verses in those suras is 1045, or 19×55. If 9:128-129 were included, the verses containing the word "God" would increase by 1.',
          'The word "God" from the missing Basmalah (Sura 9) to the extra Basmalah (Sura 27) occurs in 513 verses (19×27), within 19 suras. The total of sura numbers = 342 = 19×18. If the false Verses 9:128-129 were included, the number of verses containing the word "God" would have become 514, destroying this phenomenon.',
          'The word "Elaah" (god) occurs in Verse 9:129. The total occurrence of this word in the Quran is 95, or 19×5. Its inclusion in 9:128-129 causes this count to increase by 1, to 96.',
          'The INDEX TO THE WORDS OF THE QURAN lists 116 "Rasool" (Messenger) words. One of these is in 9:128. By removing this false verse, 115 "Rasool" words remain. Another "Rasool" word to exclude is in 12:50, referring to the "messenger of Pharaoh." Thus, "Rasool" of God totals 114, or 19×6.',
          'The word "Raheem" (Merciful) is used in the Quran exclusively as a name of God, and its total count is 114, or 19×6, after removing the word "Raheem" of 9:128, which refers to the prophet.',
          'The INDEX lists 22 occurrences of the word "`Arsh" (Throne). After removing the false injection 9:129, and the "`Arsh" of Joseph (12:100) and the Queen of Sheba (27:23), we end up with 19 "`Arsh" words.',
          'The Quranic command "Qul" (Say) occurs 332 times. The word "Qaaloo" (They said) also occurs 332 times. Since the false Verse 9:129 contains the word "Qul" (Say), its inclusion would destroy this phenomenon.',
          'The Quran contains 6234 numbered verses and 112 un-numbered verses (Basmalahs). Total: 6346, or 19×334. The false Verses 9:128-129 violate this important criterion.',
          'When we add the sura number, plus the number of verses in each sura, plus the sum of verse numbers (1+2+3+...+n), the cumulative total for the whole Quran comes to 346199, or 19×19×959. This confirms every authentic verse while excluding 9:128-129.',
        ].map((evidence, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-foreground/85">{evidence}</p>
          </div>
        ))}
      </section>

      {/* ── Key Tables ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Mathematical Tables
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      {/* Table 1: Word of God outside initialed section */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Table 1: Occurrence of &ldquo;God&rdquo; Outside the Initialed Section
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Sura</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Occurrences</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Sura</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Occurrences</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 2, 84, 1],
                [69, 1, 85, 3],
                [70, 1, 87, 1],
                [71, 7, 88, 1],
                [72, 10, 91, 2],
                [73, 7, 95, 1],
                [74, 3, 96, 1],
                [76, 5, 98, 3],
                [79, 1, 104, 1],
                [81, 1, 110, 2],
                [82, 1, 112, 2],
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-1.5 font-mono text-xs text-primary">{row[0]}</td>
                  <td className="px-4 py-1.5 font-mono text-xs">{row[1]}</td>
                  <td className="px-4 py-1.5 font-mono text-xs text-primary">{row[2]}</td>
                  <td className="px-4 py-1.5 font-mono text-xs">{row[3]}</td>
                </tr>
              ))}
              <tr className="bg-primary/5 font-semibold">
                <td colSpan={3} className="px-4 py-2 text-xs text-right text-muted-foreground">Total =</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">57 = 19×3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Word of God from missing Basmalah to extra Basmalah */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Table 2: &ldquo;God&rdquo; from Missing Basmalah (Sura 9) to Extra Basmalah (Sura 27)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">#</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Sura</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Verses with &ldquo;God&rdquo;</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 9, 100], [2, 10, 49], [3, 11, 33], [4, 12, 34],
                [5, 13, 23], [6, 14, 28], [7, 15, 2], [8, 16, 64],
                [9, 17, 10], [10, 18, 14], [11, 19, 8], [12, 20, 6],
                [13, 21, 5], [14, 22, 50], [15, 23, 12], [16, 24, 50],
                [17, 25, 6], [18, 26, 13], [19, 27, 6],
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-1.5 font-mono text-xs text-muted-foreground">{row[0]}</td>
                  <td className="px-4 py-1.5 font-mono text-xs text-primary font-semibold">{row[1]}</td>
                  <td className="px-4 py-1.5 font-mono text-xs">{row[2]}</td>
                </tr>
              ))}
              <tr className="bg-primary/5 font-semibold border-t border-border/40">
                <td className="px-4 py-2 text-xs text-muted-foreground">19</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">342 = 19×18</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">513 = 19×27</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 3: Mathematical coding of all suras and verses */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Table 3: Mathematical Coding of the Quran&apos;s Suras &amp; Verses (based on 19)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Sura No.</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">No. of Verses</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Sum of Verse #s</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 7, 28, 36],
                [2, 286, 41041, 41329],
                ['–', '–', '–', '–'],
                [9, 127, 8128, 8264],
                ['–', '–', '–', '–'],
                [114, 6, 21, 141],
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-1.5 font-mono text-xs text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-primary/5 font-semibold border-t border-border/40">
                <td className="px-4 py-2 font-mono text-xs">6555</td>
                <td className="px-4 py-2 font-mono text-xs">6234</td>
                <td className="px-4 py-2 font-mono text-xs">333410</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">346199 = 19×19×959</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional proofs 14-41 summary */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Further Mathematical Proofs
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-4 text-base leading-relaxed text-foreground/90">
        {[
          '[14] The cumulative total for all 85 un-initialed suras (including Sura 9 with 127 verses) is 156066, or 19×8214. The false verses would destroy this criterion.',
          '[15] Adding the sura numbers of all un-initialed suras plus their number of verses from the beginning to the end of Sura 9 gives 703, or 19×37. This depends on Sura 9 having 127 verses.',
          '[16] Adding the un-initialed suras\' numbers plus their verses plus the sum of verse numbers from missing Basmalah (9:1) to the end of the Quran gives 116090, or 19×6110.',
          '[17] The same calculations from 9:1 to the extra Basmalah (Sura 27) gives 119966, or 19×6314. This would be destroyed if Sura 9 had 129 verses.',
          '[18] The same calculations from 9:1 to where the number 19 is mentioned (74:30) gives 207670, or 19×10930. Sura 9 must consist of 127 verses.',
          '[19] Looking at all verses whose digits add up to 10 (just like 127: 1+2+7=10), from 9:1 to 27:29, the grand total is 2470 (19×130). The sura numbers total 342 (19×18). These phenomena would be destroyed if Sura 9 had 129 verses.',
          '[20] All suras whose number of verses ends with "9" — there are 13 such suras. Without Sura 9, the total number of verses is 627 (19×33), and the grand total (sura number + verses + sum of verse numbers) is 23655 (19×1245). If Sura 9 had 129 verses, it would be included and destroy both phenomena.',
          '[21] Counting all the 1\'s in all verse numbers of the whole Quran gives 2546, or 19×134, with Sura 9 having 127 verses. Adding verses 128 and 129 would destroy this.',
          '[22] Counting all the 1\'s in the 85 un-initialed suras gives 1406, or 19×74. Two additional 1\'s from verses 128 and 129 would violate this code.',
          '[23] Counting all the 2\'s, 8\'s, and 9\'s (the digits in 128 and 129) across all verses gives 3382, or 19×178. The grand total of 1\'s, 2\'s, 8\'s, and 9\'s is 5928, or 19×312. Including 128 and 129 would destroy this.',
          '[24] The total count of all the digits (1 through 9) in all verse numbers of the 85 un-initialed suras, including Sura 9 with 127 verses, is 27075, or 19×19×75.',
          '[25] The sum of digits of every sura number plus the sum of digits of its verse count, for all 114 suras, totals 975+906 = 1881 = 19×99.',
          '[26] Multiplying (instead of adding) the sum of digits of each sura by the sum of digits of its verse count gives a grand total of 7771, or 19×409.',
          '[27] For odd-numbered suras only: sum of digits for suras = 513 (19×27), sum for verses = 437 (19×23), grand total = 950 (19×50).',
          '[28] All suras consisting of 127 verses or less (105 suras): sum of sura numbers plus sum of verse numbers = 10963, or 19×577. Sura 9 is the only sura with exactly 127 verses.',
          '[29] All odd-numbered suras whose number of verses is also odd (27 suras): the sum of their sura numbers plus verse numbers = 2774, or 19×146.',
          '[30] All suras whose number of verses is a prime number (18 suras): the sum of digits of their sura numbers plus the sum of digits of their verse numbers = 266 = 19×14.',
          '[31] Suras whose number of verses is divisible by 3 and consists of 3 digits (suras 5, 6, 11, 12, 17, 20): their sura numbers sum to 71, their verse counts to 765, grand total = 836 = 19×44. If Sura 9 had 129 verses, it would be included and destroy this.',
          '[32] All suras consisting of 129 verses or more (8 suras: 2, 3, 4, 6, 7, 20, 26, 37): their verse counts total 1577, or 19×83. Adding Sura 9 with 129 verses would give 1706, not a multiple of 19.',
          '[33] All suras whose number of verses contains both digits "1" and "2" (9 suras): sum of sura numbers plus verse counts = 1159, or 19×61. Adding Sura 9 with 129 verses would give 1161, not a multiple of 19.',
          '[34] The only suras with a single-digit number whose verse count contains "1" and "2" are Suras 5 and 9. Their verse counts: 120+127 = 247 = 19×13.',
          '[35] All 30 suras whose verse count begins with "1": the sum of their verse numbers (1+2+3+...+n) is 126122, or 19×6638.',
          '[36] All suras where the digits of sura number and verse count add up to 19 (10 suras): their sura numbers plus verse counts = 1216, or 19×64.',
          '[37] All suras where sura digits add up to 9 and verse digits add up to 10 (4 suras: 9, 45, 54, 72): their verse counts total 247, or 19×13.',
          '[38] If Sura 9 had 129 verses, the two suras where digits of sura add up to 9 and digits of verses add up to 12 (Suras 9 and 27) would give a total of 222, not a multiple of 19.',
          '[39] All 13 suras whose verse count ends with "9": their verse counts sum to 627 (19×33), and the grand total is 23655 (19×1245) — without Sura 9.',
          '[40] Odd-numbered suras whose verse count ends with "9" (6 suras: 15, 29, 43, 57, 81, 87): sum of sura numbers plus verse counts = 646, or 19×34. Including Sura 9 with 129 verses would give 784, not a multiple of 19.',
          '[41] All 7 suras whose verse count ends with "7" (1, 9, 25, 26, 45, 86, 107): grand total of sura numbers plus verse counts = 798, or 19×42.',
        ].map((proof, i) => (
          <p key={i} className="text-sm leading-relaxed text-foreground/85">
            {proof}
          </p>
        ))}
      </section>

      {/* ── Conclusion ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Conclusion
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3"
      >
        <p className="text-base leading-relaxed text-foreground/90">
          As it turns out, the injection of the two false Verses 9:128-129 resulted
          in: (1) demonstrating the major function of the Quran&apos;s mathematical
          system, (2) producing an awesome miracle in its own right, and (3)
          distinguishing the true believers from the hypocrites (they uphold
          traditions).
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          The discovery of the Quran&apos;s mathematical code in 1974 ushered in a
          new era where the authenticity of every element in the Quran is proven (see{' '}
          <Link href="/appendices/1" className="text-primary underline underline-offset-2">
            Appendix 1
          </Link>
          ). The mathematical evidence presented above comprises more than 40
          independent proofs, all of which confirm that Sura 9 consists of 127
          verses, and that Verses 9:128-129 are false human injections.
        </p>
      </div>
    </>
  )
}
