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
          As stated in <QuranRef reference="3:81" />, and in{' '}
          <Link href="/appendices/2">Appendix 2</Link>, God has sent a messenger to consolidate
          the messages delivered by all the prophets, purify them, and unify them into one
          religion: Submission. The timing is certainly ripe for fulfillment of this important
          prophecy, for the following reasons:
        </p>
        <ol className="space-y-2 list-none">
          <li className="flex items-baseline gap-3">
            <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">1</span>
            <p>Judaism, Christianity, and Islam have been corrupted beyond recognition.</p>
          </li>
          <li className="flex items-baseline gap-3">
            <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">2</span>
            <p>All God&apos;s messages have been delivered; the Quran is the Final Testament.</p>
          </li>
          <li className="flex items-baseline gap-3">
            <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">3</span>
            <p>
              More than 93% of the human beings destined to live in this world are yet to come.
              The people who have lived on this earth since Adam are only one-fifteenth of the
              total projected human population.
            </p>
          </li>
        </ol>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Judaism
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The best illustration of today&apos;s corrupted Judaism can be found in the books of
          a famous Rabbi, Harold S. Kushner. In his best seller{' '}
          <em>When Bad Things Happen to Good People</em> (Avon Books, 1981), Rabbi Kushner
          states:
        </p>
      </section>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 text-sm italic text-foreground/80">
        <p>&ldquo;…we would be advised to take this world as seriously as we can, in case it turns out to be the only one we will ever have, and to look for meaning and justice here.&rdquo; (p. 29)</p>
        <p>&ldquo;Bad things do happen to good people in this world, but it is not God who wills it. God would like people to get what they deserve, but He cannot always arrange it.&rdquo; (p. 42)</p>
        <p>&ldquo;God does not reach down to interrupt the workings of laws of nature to protect the righteous from harm… and God cannot stop it.&rdquo; (p. 58)</p>
        <p>&ldquo;God can&apos;t do everything, but He can do some important things.&rdquo; (p. 113)</p>
        <p>&ldquo;We can&apos;t ask Him to make us immune to disease, because He can&apos;t do that.&rdquo; (p. 125)</p>
        <p>&ldquo;I recognize His limitations. He is limited in what He can do by laws of nature, and by the evolution of human nature and human moral freedom.&rdquo; (p. 134)</p>
      </div>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Christianity
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          If Jesus came back to life today, the Christians would crucify him. Outstanding
          Christian scholars have reached solid conclusions that today&apos;s Christianity has
          nothing to do with Jesus, and that its doctrine was mortally distorted at the
          infamous Nicene Conferences (325 A.D.). See <em>The Myth of God Incarnate</em>{' '}
          (Westminster Press, Philadelphia, 1977).
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Islam
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          If Muhammad came back to this world, the &ldquo;Muslims&rdquo; would stone him to
          death. The religion they follow today has nothing to do with the Islam, i.e.,
          Submission, preached by Abraham and Muhammad. Everything the &ldquo;Muslims&rdquo; do
          is wrong: the First Pillar (Shahaadah), the call to Salat prayer (Azan), the
          ablution (Wudu), the daily Salat prayers, the Zakat charity, Hajj, and all other
          practices of Islam (see{' '}
          <Link href="/appendices/2">Appendices 2</Link>,{' '}
          <Link href="/appendices/13">13</Link>, &amp;{' '}
          <Link href="/appendices/15">15</Link>).
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          &ldquo;A Religion Never Authorized by God&rdquo; — <QuranRef reference="42:21" />
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The extent to which Islam has been corrupted is illustrated in the following table of
          innovations and the Quranic principles they violate:
        </p>
      </section>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-border/40 px-3 py-2 text-left">Innovation</th>
              <th className="border border-border/40 px-3 py-2 text-left">Violated Quranic Principles</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Hadith &amp; Sunna</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="6:19" />, <QuranRef reference="6:38" />,{' '}
                <QuranRef reference="6:114" />; <QuranRef reference="7:1-3" />;{' '}
                <QuranRef reference="12:111" />; <QuranRef reference="17:46" />;{' '}
                <QuranRef reference="31:6" />; <QuranRef reference="45:6" />;{' '}
                <QuranRef reference="69:38-47" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Killing those considered apostates</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="2:256" />; <QuranRef reference="4:90" />;{' '}
                <QuranRef reference="10:99" />; <QuranRef reference="18:29" />;{' '}
                <QuranRef reference="88:21-22" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Cutting off the hand of the thief</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="5:38" />; <QuranRef reference="12:31" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Stoning adulterers to death</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="24:2" />; <QuranRef reference="4:25" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Killing those who do not observe Salat</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="2:256" />; <QuranRef reference="18:29" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Forbidding menstruating women from worshiping</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="2:222" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Forbidding women from the Friday Prayer</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="62:9" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Calling Muhammad &ldquo;the most honorable messenger&rdquo;</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="2:285" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Claiming Muhammad was infallible</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="4:79" />; <QuranRef reference="9:117" />;{' '}
                <QuranRef reference="17:73-74" />; <QuranRef reference="33:37" />;{' '}
                <QuranRef reference="66:1" />; <QuranRef reference="80:1-10" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Setting up his tomb as a &ldquo;Sacred Mosque&rdquo;</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="2:149-150" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Claiming Muhammad possesses power of intercession</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="2:48" />; <QuranRef reference="2:123" />;{' '}
                <QuranRef reference="6:94" />; <QuranRef reference="39:44" />;{' '}
                <QuranRef reference="43:86" />; <QuranRef reference="74:48" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Adding his name to the Salat prayers &amp; Azan</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="20:14" />; <QuranRef reference="72:18" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Adding his name to the First Pillar of Islam</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="3:18" />; <QuranRef reference="37:35" />;{' '}
                <QuranRef reference="39:45" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Teaching that Jesus will come back (making Jesus the last prophet)</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="33:40" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Claiming Muhammad was illiterate</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                See <Link href="/appendices/28">Appendix 28</Link>
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Bizarre dietary prohibitions</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="6:145-150" />; <QuranRef reference="16:115-116" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Altering the Sacred Months</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="9:37" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Neglecting the Zakat charity through distortion</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="6:141" />; <Link href="/appendices/15">Appendix 15</Link>
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Oppressing women and depriving them of rights in marriage, divorce, and inheritance</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="2:228" />; <QuranRef reference="3:195" />;{' '}
                <QuranRef reference="4:19" />; <QuranRef reference="4:32" />;{' '}
                <QuranRef reference="9:71" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Prohibiting gold and silk for men</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="5:48-49" />; <QuranRef reference="7:31-32" />
              </td>
            </tr>
            <tr>
              <td className="border border-border/40 px-3 py-2 text-left">Prohibiting music and the arts</td>
              <td className="border border-border/40 px-3 py-2 text-left">
                <QuranRef reference="7:32" />; <QuranRef reference="34:13" />;{' '}
                <QuranRef reference="42:21" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This is only a minute sample of the violations committed by the
          &ldquo;Muslims&rdquo; on a daily basis. This is why God has sent His Messenger of the
          Covenant now.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="qaJTFggUvDU" title="Appendix 33 — Why Did God Send A Messenger Now?" />
      </section>
    </>
  )
}
