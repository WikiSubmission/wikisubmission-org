import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'

function Divider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4" data-parallax>
      <hr className="flex-1 border-border/50" />
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0 text-center">
        {title}
      </h2>
      <hr className="flex-1 border-border/50" />
    </div>
  )
}

function MathSeq({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/40 bg-muted/20 px-4 py-2 my-1">
      <code className="text-xs font-mono text-primary whitespace-nowrap">{children}</code>
    </div>
  )
}

export function AppendixContent() {
  return (
    <>
      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          When Abraham implored God in <QuranRef reference="14:40" />, he did
          not ask for wealth or health; the gift he implored for was:{' '}
          <em>
            &ldquo;Please God, make me one who observes the contact prayers
            (Salat).&rdquo;
          </em>{' '}
          The religious duties instituted by God are in fact a great gift from
          Him. They constitute the nourishment required for the growth and
          development of our souls. Without such nourishment, we cannot
          survive the immense energy associated with God&rsquo;s physical
          presence on the Day of Judgment. Belief in God does not by itself
          guarantee our redemption; we must also nourish our souls (
          <QuranRef reference="6:158" />, <QuranRef reference="10:90" />–
          <QuranRef reference="10:92" />). Additionally,{' '}
          <QuranRef reference="15:99" /> states that observing the religious
          duties instituted by God is our means of attaining certainty:{' '}
          <em>&ldquo;Worship your Lord in order to attain certainty.&rdquo;</em>
        </p>
      </section>

      <Divider title="The Contact Prayers (Salat)" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The five daily contact prayers are the main meals for the soul.
          While a soul may attain some growth and development by leading a
          righteous life, and without observing the contact prayers, this
          would be like surviving on snacks without regular meals.
        </p>
        <p>
          We learn from <QuranRef reference="2:37" /> that we can establish
          contact with God by uttering the specific Arabic words given to us
          by God. Sura 1, The Key, is a mathematically composed combination of
          sounds that unlocks the door between us and God:
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
                ['Dawn', 'During the two hours before sunrise', '2', '11:114, 24:58'],
                ['Noon', 'When the sun declines from its highest point at noon', '4', '17:78'],
                ['Afternoon', 'During the 3-4 hours preceding sunset', '4', '2:238'],
                ['Sunset', 'After sunset', '3', '11:114'],
                ['Night', 'After the twilight disappears from the sky', '4', '24:58'],
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
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Friday noon congregational prayer is an obligatory duty upon
          every Submitting man and woman (<QuranRef reference="62:9" />).
          Failure to observe the Friday Prayer is a gross offense.
        </p>
        <p>
          Each contact prayer is valid if observed anytime during the period
          it becomes due until the next prayer becomes due. Once missed, a
          given contact prayer is a missed opportunity that cannot be made up;
          one can only repent and ask forgiveness. The five prayers consist of
          2, 4, 4, 3, and 4 units (Rak&rsquo;ahs), respectively.
        </p>
        <p>
          The proof that Salat was already established through Abraham is found
          in <QuranRef reference="8:35" />, <QuranRef reference="9:54" />,{' '}
          <QuranRef reference="16:123" />, &amp; <QuranRef reference="21:73" />.
          This most important duty in Islam (Submission) has been so severely
          distorted that the contact prayers (Salat) have become a practice in
          idolatry for the vast majority of Muslims. Although the Quran commands
          that our contact prayers must be devoted to God alone (
          <QuranRef reference="20:14" />; <QuranRef reference="39:3" />,{' '}
          <QuranRef reference="39:45" />), today&rsquo;s Muslims insist on
          commemorating &ldquo;Muhammad and his family&rdquo; and &ldquo;Abraham
          and his family&rdquo; during their prayers. This renders the prayers
          null and void (<QuranRef reference="39:65" />).
        </p>
        <p>
          The following text, pertaining to the miracles confirming the contact
          prayers, is excerpted (with minor editing), from the January 1990
          issues of the Submitter&rsquo;s Perspective (the regular and special
          bonus issues), as written by Dr. Rashad Khalifa:
        </p>
      </section>

      <Divider title="Awesome Mathematical Miracle Confirms All The 5 Contact Prayers" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <strong>[1]</strong> Sura 1 is God&rsquo;s gift to us, to establish
          contact with Him (Salat). Write the sura number and the number of
          verses next to each other and you get 17, the total number of units
          in the 5 daily prayers.
        </p>
        <p>
          <strong>[2]</strong> Let us write down the sura number, followed by
          the number of every verse in the sura. This is what we get:
        </p>
        <MathSeq>1 1 2 3 4 5 6 7</MathSeq>
        <p>This number is a multiple of 19.</p>
      </section>

      {/* Properties of Sura 1 table */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Properties of Sura 1, The Key
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground font-mono">Verse No</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground font-mono">No of Letters</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground font-mono">Gematrical Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 19, 786],
                [2, 17, 581],
                [3, 12, 618],
                [4, 11, 241],
                [5, 19, 836],
                [6, 18, 1072],
                [7, 43, 6009],
              ].map(([v, l, g]) => (
                <tr
                  key={v}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 font-mono text-xs text-primary font-semibold">{v}</td>
                  <td className="px-4 py-2 font-mono text-xs text-right text-muted-foreground">{l}</td>
                  <td className="px-4 py-2 font-mono text-xs text-right text-muted-foreground">{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <strong>[3]</strong> Now, let us replace each verse number by the
          number of letters in that verse. This is what we get:
        </p>
        <MathSeq>1 19 17 12 11 19 18 43</MathSeq>
        <p>
          also a multiple of 19. Theoretically, one can alter the letters of
          Sura 1, and still keep the same number of letters, however, the
          following mathematical phenomena rule out that possibility. For the
          gematrical value of every single letter is taken into consideration.
          Here it is:
        </p>
        <p>
          <strong>[4]</strong> Let us include the gematrical value of every
          verse, and write it down following the number of letters in each
          verse:
        </p>
        <MathSeq>1 19 786 17 581 12 618 11 241 19 836 18 1072 43 6009</MathSeq>
        <p>also a multiple of 19.</p>
        <p>
          <strong>[5]</strong> Now, let us add the number of each verse, to be
          followed by the number of letters in that verse, then the gematrical
          value of that verse. This is what we get:
        </p>
        <MathSeq>1 1 19 786 2 17 581 3 12 618 4 11 241 5 19 836 6 18 1072 7 43 6009</MathSeq>
        <p>a multiple of 19.</p>
        <p>
          <strong>[6]</strong> Instead of the gematrical values of every verse,
          let us write down the gematrical values of every individual letter in
          Sura 1. This truly awesome miracle, shows that the resulting long
          number, consisting of 274 digits, is also a multiple of 19. ALLAHU
          AKBAR.
        </p>
        <MathSeq>1 7 1 19 2 60 40 1 30 30 5 1 30 200 8 40 50 1 30 200 8 10 40 2 17 ... 50</MathSeq>
        <p>
          This number starts with the sura number, followed by the number of
          verses in the sura, followed by the verse number, followed by the
          number of letters in this verse, followed by the gematrical values of
          every letter in this verse, followed by the number of the next verse,
          followed by the number of letters in this verse, followed by the
          gematrical values of every letter in this verse, and so on to the end
          of the sura. Thus, the last component is 50, the value of &ldquo;N&rdquo;
          (last letter).
        </p>
        <p>
          <strong>[7]</strong> Since I cannot write very long numbers here, let
          us substitute [*] for the long number consisting of the number of
          every verse, followed by the number of letters in the verse, followed
          by the gematrical value of every individual letter in the verse. If
          we write down the number of the sura, followed by its number of
          verses, we get 17, the number of units (Rak&rsquo;aas) in the 5 daily
          prayers. Next to the 17, write down the number of the first prayer
          (1), followed by its number of Rak&rsquo;aas, which is 2, then two
          [*]&rsquo;s, followed by the number of the second prayer (2), followed
          by the number of Rak&rsquo;aas in the second prayer (4), followed by
          four [*]&rsquo;s, and so on. Not only is the resulting long number a
          multiple of 19, but also the number of its component digits is 4636
          (19x244) ....
        </p>
        <MathSeq>17 12[*][*] 24[*][*][*][*] 34[*][*][*][*] 43[*][*][*] 54[*][*][*][*]</MathSeq>
      </section>

      <Divider title="Confirmation of Friday Prayers" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <strong>[8]</strong> Since the Friday prayer consists of two sermons
          and two Rak&rsquo;aas (total is still 4 units), we read only 15
          &ldquo;Keys&rdquo; on Friday, compared with 17 on the other days.
          Abdullah Arik discovered that if we replace the 17 by 15 in the long
          number in [7], we must remove two &ldquo;Keys&rdquo; from the noon
          prayer to get a multiple of 19. This confirms the Friday Prayer, at
          noon, with 2 &ldquo;Keys.&rdquo; The long number shown below
          represents Friday&rsquo;s five prayers; it is a multiple of 19.
        </p>
        <MathSeq>15 12[*][*] 24[*][*] 34[*][*][*][*] 43[*][*][*] 54[*][*][*][*]</MathSeq>
        <p>
          Please note that, Dr. Khalifa indicated, there are other similar
          patterns that result in multiples of 19. For example, a short
          representation of &ldquo;The Key&rdquo; consists of the Sura number
          (1), followed by the number of verses (7), followed by the total
          number of letters in Sura 1 (139), followed by the total gematrical
          value of the whole sura (10143). The resulting number (1713910143)
          representing [*] can be used in the above patterns, without including
          the sequence number of the prayers. The resultant numbers for both
          regular and Friday prayer representations are multiples of 19. For
          example, here is the pattern for the regular prayers:
        </p>
        <MathSeq>17 2[*][*] 4[*][*][*][*] 4[*][*][*][*] 3[*][*][*] 4[*][*][*][*]</MathSeq>
      </section>

      <Divider title="&ldquo;The Key&rdquo; (Al-Fateha) Must Be Recited in Arabic" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <strong>[9]</strong> The first sura in the Quran is mathematically
          composed in a manner that challenges and stumps the greatest
          mathematicians on earth. Now we appreciate the fact that when we
          recite Sura 1, &ldquo;The Key,&rdquo; during our Contact Prayers,
          something happens in the universe, and we establish contact with our
          Creator. The result is perfect happiness, now and forever. By
          contacting our Almighty Creator 5 times a day, we nourish and develop
          our souls in preparation for the Big Day when we meet God. Only those
          who nourish their soul will be able to withstand and enjoy the
          physical presence of Almighty God.
        </p>
        <p>
          All submitters, of all nationalities, recite the words of &ldquo;The
          Key&rdquo; which were written by God Himself, and given to us to
          establish contact with Him (<QuranRef reference="2:37" />).
        </p>
        <p>
          Edip Yuksel&rsquo;s discovery adds to the awesomeness of &ldquo;The
          Key&rdquo; and proclaims clearly that it must be recited in Arabic.
        </p>
        <p>
          When you recite &ldquo;The Key&rdquo; in Arabic, your lips touch each
          other precisely 19 times.
        </p>
        <p>
          Furthermore, your lips touch each other where the letters &ldquo;B&rdquo;
          and &ldquo;M&rdquo; occur. There are 4 &ldquo;B&rsquo;s&rdquo; and 15
          &ldquo;M&rsquo;s&rdquo; and this adds up to 19. The gematrical value of
          the 4 &ldquo;B&rsquo;s&rdquo; is 4x2=8, and the gematrical value of the
          15 &ldquo;M&rsquo;s&rdquo; is 15x40=600. The total gematrical value of
          the 4 &ldquo;B&rsquo;s&rdquo; and 15 &ldquo;M&rsquo;s&rdquo; is 608,
          that is 19x32.
        </p>
      </section>

      {/* Lip-touch table */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Lip-Touch Letters in Al-Fateha
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground font-mono">#</th>
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
                ['`Alamin', 'M', 40],
                ['Rahman', 'M', 40],
                ['Rahim', 'M', 40],
                ['Malik', 'M', 40],
                ['Yawm', 'M', 40],
                ["Na'budu", 'B', 2],
                ['Mustaqim', 'M', 40],
                ['Mustaqim', 'M', 40],
                ['An`amta', 'M', 40],
                ['`Alayhim', 'M', 40],
                ['Maghdub', 'M', 40],
                ['Maghdub', 'B', 2],
                ['`Alayhim', 'M', 40],
              ].map(([word, letter, value], i) => (
                <tr
                  key={i}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{i + 1}.</td>
                  <td className="px-4 py-2 text-xs font-mono">{word}</td>
                  <td className="px-4 py-2 text-xs text-primary font-semibold">{letter}</td>
                  <td className="px-4 py-2 text-xs font-mono text-right text-muted-foreground">{value}</td>
                </tr>
              ))}
              <tr className="bg-primary/5 border-t border-primary/20">
                <td className="px-4 py-2 text-xs font-semibold" colSpan={3}>Total</td>
                <td className="px-4 py-2 text-xs font-mono font-bold text-primary text-right">608 (19x32)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Divider title="Confirmation of the 5 Daily Prayers, Number of Bowings (Ruku'), Prostrations (Sujood), and Tashahhud" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <strong>[10]</strong> One of the common challenges... is: &ldquo;If
          the Quran is complete and detailed (as claimed in{' '}
          <QuranRef reference="6:19" />, <QuranRef reference="6:38" />, &amp;{' '}
          <QuranRef reference="6:114" />), where are the details of the Contact
          Prayers (Salat)?&rdquo; These people ask this question because they
          are not aware that the Quran informs us that the Contact Prayers came
          from Abraham (<QuranRef reference="21:73" /> &amp;{' '}
          <QuranRef reference="22:78" />).... Saeed Talari... wrote down the
          numbers of the prayers with their bowings, prostrations and
          Tashahhuds...:
        </p>
        <MathSeq>1 1 2 2 4 1 2 4 4 8 2 3 4 4 8 2 4 3 3 6 2 5 4 4 8 2</MathSeq>
        <p>
          This long number consists of the sura that we recite in the 5 prayers
          (1) followed by the number of the first prayer (1), then the number
          of &ldquo;Keys&rdquo; that we recite in this prayer (2), then the
          number of bowings (Ruku`) (2), then the number of prostrations
          (4), then the number of Tashahhuds (in the sitting position) (1),
          then the number of the second prayer (2), then the number of
          &ldquo;Keys&rdquo; that we recite in the second prayer (4), then the
          number of bowings (Ruku`) in this prayer (4), then the number
          of prostrations (8), then the number of Tashahhuds (2), then the
          number of the third prayer (3), and so on to the last prayer. This
          long number is a multiple of 19, and this confirms the minutest
          details of the prayers, even in the numbers of Ruku`, Sujud,
          and Tashahhud.
        </p>
      </section>

      <Divider title="The Obligatory Charity (Zakat)" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Zakat must be given away &ldquo;on the day of harvest&rdquo; (
          <QuranRef reference="6:141" />). Whenever we receive &ldquo;net
          income,&rdquo; we must set aside 2.5% and give it to the specified
          recipients — the parents, relatives, orphans, the poor, and the
          traveling alien, in this order (<QuranRef reference="2:215" />). The
          vital importance of Zakat is reflected in God&rsquo;s law:{' '}
          <em>
            &ldquo;My mercy encompasses all things, but I will specify it for
            the righteous who give Zakat&rdquo;
          </em>{' '}
          (<QuranRef reference="7:156" />).
        </p>
        <p>
          Zakat must be carefully calculated and given away on a regular basis
          whenever we receive any income. Government taxes should be deducted,
          but not other expenses such as debts, mortgages, and living expenses.
          If one does not know needy persons, he or she may give the Zakat to a
          mosque or charitable organization with the distinct purpose of
          helping poor people. Charities given to mosques or hospitals or
          organizations cannot be considered Zakat.
        </p>
      </section>

      <Divider title="Fasting" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The full details of fasting are given in{' '}
          <QuranRef reference="2:183" />–<QuranRef reference="2:187" />.
        </p>
      </section>

      <Divider title="Pilgrimage: Hajj & 'Umrah" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Once in a lifetime, Hajj and &lsquo;Umrah are decreed for those who
          can afford it. Pilgrimage commemorates Abraham&rsquo;s exemplary
          submission to God (
          <Link href="/quran/appendix/9" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 9
          </Link>
          ), and must be observed during the four Sacred Months — Zul-Hijjah,
          Muharram, Safar, &amp; Rabi` I (12th, 1st, 2nd, 3rd months) (
          <QuranRef reference="2:197" />; <QuranRef reference="9:2" />,{' '}
          <QuranRef reference="9:36" />). &lsquo;Umrah can be observed any time.
          Like all other duties in Islam, Hajj has been distorted. Most Muslims
          observe Hajj only during a few days in Zul-Hijjah, and they consider
          Rajab, Zul-Qi&rsquo;dah, Zul-Hijjah, and Muharram (7th, 11th, 12th,
          1st months) to be the Sacred Months. This is a distortion that is
          strongly condemned (<QuranRef reference="9:37" />).
        </p>
        <p>
          The pilgrimage begins with a bath or shower, followed by a state of
          sanctity called &ldquo;Ihraam,&rdquo; where the male pilgrim wears
          seamless sheets of material, and the woman wears a modest dress (
          <QuranRef reference="2:196" />). Throughout Hajj, the pilgrim abstains
          from sexual intercourse, vanities such as shaving and cutting the
          hair, arguments, misconduct, and bad language (
          <QuranRef reference="2:197" />). Cleanliness, bathing, and regular
          hygiene practices are encouraged. Upon arrival at the Sacred Mosque in
          Mecca, the pilgrim walks around the Ka`bah seven times, while
          glorifying and praising God (<QuranRef reference="2:125" />,{' '}
          <QuranRef reference="22:26" />–<QuranRef reference="22:29" />). The
          common formula is: &ldquo;Labbayka Allaahumma Labbayk&rdquo; (My God,
          I have responded to You). &ldquo;Labbayka Laa Shareeka Laka
          Labbayk&rdquo; (I have responded to You, and I proclaim that there is
          no other god besides You; I have responded to You). The next step is
          to walk the half-mile distance between the knolls of Safa and Marwah
          seven times, with occasional trotting (<QuranRef reference="2:158" />).
          This completes the &lsquo;Umrah portion of the pilgrimage.
        </p>
        <p>
          The pilgrim then goes to &lsquo;Arafat to spend a day of worship,
          meditation, and glorification of God, from dawn to sunset (
          <QuranRef reference="2:198" />). After sunset, the pilgrim goes to
          Muzdalifah where the Night Prayer is observed, and 21 pebbles are
          picked up for the symbolic stoning of Satan at Mina. From Muzdalifah,
          the pilgrim goes to Mina to spend two or three days (
          <QuranRef reference="2:203" />). On the first morning at Mina, the
          pilgrim offers an animal sacrifice to feed the poor and to commemorate
          God&rsquo;s intervention to save Ismail and Abraham from Satan&rsquo;s
          trick (<QuranRef reference="37:107" />,{' '}
          <Link href="/quran/appendix/9" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 9
          </Link>
          ). The stoning ceremonies symbolize rejection of Satan&rsquo;s
          polytheism and are done by throwing seven pebbles at each of three
          stations, while glorifying God (<QuranRef reference="15:34" />). The
          pilgrim then returns to Mecca and observes a farewell circumvolution
          of the Ka`bah seven times.
        </p>
        <p>
          Unfortunately, most of today&rsquo;s Muslim pilgrims make it a custom
          to visit the prophet Muhammad&rsquo;s tomb where they commit the most
          flagrant acts of idolatry and thus nullify their Hajj. The Quran
          consistently talks about &ldquo;The Sacred Mosque,&rdquo; while
          today&rsquo;s Muslims talk about &ldquo;The Two Sacred
          Mosques!&rdquo; In a glaring act of idolatry, the Muslims have set up
          Muhammad&rsquo;s tomb as another &ldquo;Sacred Mosque!&rdquo; This is
          a blasphemous violation of the Quran, and, ironically, even violates
          Hadith. The Hadith shown below illustrates this strange irony:
        </p>
      </section>

      {/* False Hadith quote */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;God has cursed the Jews and Christians for turning the tombs of
          their prophets into mosques.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground">
          Translation of this false statement. [Bukhari, Nawawi Edition, Vol. 6,
          Page 14]
        </p>
      </div>

      <Divider title="Physical Benefits" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          In addition to their invaluable spiritual benefits, there is a
          plethora of physical, economic, and health benefits from observing
          the contact prayers (Salat), obligatory charity (Zakat), fasting
          during the month of Ramadan, and Hajj.
        </p>
        <p>
          Observing the Dawn prayer interrupts long periods of stillness during
          sleep; this is now proven to help prevent arthritis. Also, getting up
          early in the morning helps combat depression and other psychological
          problems. The prostration position which is repeated during the
          contact prayers expands the blood vessels in our brains to accommodate
          more blood, and this prevents headaches. The repeated bending of the
          back and the joints is a healthful exercise. All these are
          scientifically established facts.
        </p>
        <p>
          The ablutions required prior to the contact prayers encourage us to
          use the toilet more frequently. This habit protects us from a common
          and devastating cancer, colon cancer. Harmful chemicals are excreted
          in the urine and fecal matter. If these excretions are kept in the
          colon for prolonged periods of time, the harmful materials are
          re-absorbed into the body, and cause cancer.
        </p>
        <p>
          Fasting during the month of Ramadan restores our expanded stomachs to
          their normal sizes, lowers our blood pressure through temporary
          dehydration, rids the body of harmful toxins, gives our kidneys a much
          needed rest, and reduces our weight by removing excessive and harmful
          fat.
        </p>
        <p>
          Zakat charity and Hajj pilgrimage have far reaching economic and
          social benefits.
        </p>
      </section>
    </>
  )
}
