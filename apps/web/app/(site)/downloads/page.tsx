import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink } from 'lucide-react'
import { FaAndroid, FaApple } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/constants/metadata'

export const metadata = buildPageMetadata({
  title: 'Downloads | WikiSubmission',
  description: 'Download the Quran, books, and apps from WikiSubmission.',
  url: '/downloads',
})

const DownloadLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/40 hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium group"
  >
    {label}
    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
  </a>
)

export default async function Downloads() {
  const t = await getTranslations('downloads')

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {t('heading')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Mobile Apps */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-headline text-2xl font-bold">Mobile Apps</h2>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://apps.apple.com/us/app/submission-religion-of-god/id6444260632"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border transition-all editorial-shadow"
          >
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center group-hover:bg-muted/60 transition-colors">
              <FaApple size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-bold text-base mb-0.5">iOS App</h3>
              <p className="text-sm text-muted-foreground">iPhone, iPad and Mac</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-primary font-semibold">
              App Store <ExternalLink size={11} />
            </span>
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.kuransonahit.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border transition-all editorial-shadow"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-500/20 transition-colors">
              <FaAndroid size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-bold text-base mb-0.5">Android App</h3>
              <p className="text-sm text-muted-foreground">By Karfeliston</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-primary font-semibold">
              Google Play <ExternalLink size={11} />
            </span>
          </a>
        </div>
      </section>

      {/* Books & Publications */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-headline text-2xl font-bold">Books & Publications</h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Quran: The Final Testament — featured */}
          <div
            id="quran-final-testament"
            className="bg-background rounded-2xl border border-border/40 editorial-shadow overflow-hidden mb-6"
          >
            <div className="p-6 flex items-center gap-4 border-b border-border/40">
              <Image
                src="https://www.masjidtucson.org/images/catalog/bQuranCoverThumb.jpg"
                alt="Quran Cover"
                width={64}
                height={64}
                className="rounded-xl shadow-sm shrink-0"
              />
              <div>
                <h3 className="font-headline text-xl font-bold">
                  Quran: The Final Testament
                </h3>
                <p className="text-sm text-muted-foreground">Dr. Rashad Khalifa, Ph.D.</p>
              </div>
            </div>
            <div className="p-6">
              <Tabs defaultValue="full-pdf">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="full-pdf">{t('tabFullPdf')}</TabsTrigger>
                  <TabsTrigger value="appendices">{t('tabAppendices')}</TabsTrigger>
                  <TabsTrigger value="physical-copies">{t('tabPhysicalCopies')}</TabsTrigger>
                </TabsList>

                <TabsContent value="full-pdf" className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    Original English Edition by{' '}
                    <Link
                      href="/submission/rashad-khalifa"
                      className="text-primary hover:underline"
                    >
                      Dr. Rashad Khalifa
                    </Link>
                  </p>
                  {[
                    ['English', 'quran-the-final-testament'],
                    ['Turkish', 'quran-the-final-testament-turkish'],
                    ['French', 'quran-the-final-testament-french'],
                    ['Spanish', 'quran-the-final-testament-spanish'],
                    ['Persian', 'quran-the-final-testament-persian'],
                    ['Tamil', 'quran-the-final-testament-tamil'],
                    ['Hindi', 'quran-the-final-testament-hindi'],
                    ['Arabic (with English)', 'quran-the-final-testament-with-arabic'],
                  ].map(([label, file], i) => (
                    <DownloadLink
                      key={i}
                      href={`https://library.wikisubmission.org/file/${file}`}
                      label={label as string}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="appendices" className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    From the original translation. See all{' '}
                    <Link
                      href="/submission/appendices"
                      className="text-primary hover:underline"
                    >
                      38 appendices
                    </Link>
                    .
                  </p>
                  {[
                    ['English', 'quran-the-final-testament-appendices'],
                    ['Turkish', 'quran-the-final-testament-appendices-turkish'],
                    ['French', 'quran-the-final-testament-appendices-french'],
                    ['Persian', 'quran-the-final-testament-appendices-persian'],
                    ['Tamil', 'quran-the-final-testament-appendices-tamil'],
                    ['Hindi', 'quran-the-final-testament-appendices-hindi'],
                  ].map(([label, file], i) => (
                    <DownloadLink
                      key={i}
                      href={`https://library.wikisubmission.org/file/${file}`}
                      label={label as string}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="physical-copies" className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    Order from online retailers.
                  </p>
                  <DownloadLink
                    href="https://www.masjidtucson.org/publications/catalog/index.html"
                    label="Masjid Tucson"
                  />
                  <DownloadLink
                    href="https://www.barnesandnoble.com/w/quran-the-final-testament-authorized-english-version-dr-rashad-khalifa/1008697516"
                    label="Barnes & Noble"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* 3-col grid for remaining books */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Visual Presentation */}
            <div
              id="visual-presentation"
              className="bg-background rounded-2xl border border-border/40 editorial-shadow p-6 flex flex-col gap-4"
            >
              <Image
                src="https://www.masjidtucson.org/images/catalog/quran_VP_thumb.png"
                alt="Visual Presentation Cover"
                width={56}
                height={56}
                className="rounded-xl shadow-sm"
              />
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="font-headline font-bold text-base leading-snug mb-1">
                    Visual Presentation of the Miracle
                  </h3>
                  <p className="text-xs text-muted-foreground">Dr. Rashad Khalifa, Ph.D.</p>
                </div>
                <DownloadLink
                  href="https://library.wikisubmission.org/file/visual-presentation-of-the-miracle"
                  label={t('downloadPdf')}
                />
              </div>
            </div>

            {/* QHI */}
            <div
              id="quran-hadith-islam"
              className="bg-background rounded-2xl border border-border/40 editorial-shadow p-6 flex flex-col gap-4"
            >
              <Image
                src="https://www.masjidtucson.org/images/catalog/QHICoverThumb.jpg"
                alt="QHI Cover"
                width={56}
                height={56}
                className="rounded-xl shadow-sm"
              />
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="font-headline font-bold text-base leading-snug mb-1">
                    Quran, Hadith, and Islam
                  </h3>
                  <p className="text-xs text-muted-foreground">Dr. Rashad Khalifa, Ph.D.</p>
                </div>
                <div className="space-y-2">
                  <DownloadLink
                    href="https://library.wikisubmission.org/file/quran-hadith-and-islam-original"
                    label="Original PDF"
                  />
                  <DownloadLink
                    href="https://library.wikisubmission.org/file/quran-hadith-and-islam"
                    label="Alternative Format"
                  />
                </div>
              </div>
            </div>

            {/* The Computer Speaks */}
            <div
              id="computer-speaks"
              className="bg-background rounded-2xl border border-border/40 editorial-shadow p-6 flex flex-col gap-4"
            >
              <Image
                src="https://www.masjidtucson.org/images/catalog/CompSpksCoverThumb.jpg"
                alt="Computer Speaks Cover"
                width={56}
                height={56}
                className="rounded-xl shadow-sm"
              />
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="font-headline font-bold text-base leading-snug mb-1">
                    The Computer Speaks: God&apos;s Message to The World
                  </h3>
                  <p className="text-xs text-muted-foreground">Dr. Rashad Khalifa, Ph.D.</p>
                </div>
                <DownloadLink
                  href="https://library.wikisubmission.org/file/the-computer-speaks"
                  label="Download PDF"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Resources */}
      <section id="other-resources" className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-headline text-2xl font-bold">Community Resources</h2>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "Beyond Probability – God's Message in Mathematics",
              author: 'Abdula Arik',
              links: [
                { label: 'Download PDF (Series I)', file: 'beyond-probability' },
                { label: 'Download PDF (Series II)', file: 'beyond-probability-series-2' },
              ],
            },
            {
              title: 'The Math Miracle — Intended or Coincidence',
              author: 'Mike J.',
              links: [
                { label: 'Download PDF', file: 'math-miracle-intended-or-coincidence' },
              ],
            },
            {
              title: 'Al-Quran The Ultimate Miracle',
              author: 'Ahmed Deedat',
              links: [
                { label: 'Download PDF', file: 'ultimate-miracle-of-the-quran' },
              ],
            },
            {
              title: "Nineteen: God's Signature in Nature and Scripture",
              author: 'Edip Yuksel',
              links: [
                {
                  label: 'Download PDF',
                  file: 'nineteen-gods-signature-in-nature-and-scripture',
                },
              ],
            },
          ].map((book, i) => (
            <div
              key={i}
              className="bg-background rounded-2xl border border-border/40 editorial-shadow p-6 space-y-3"
            >
              <div>
                <h3 className="font-headline font-bold text-base leading-snug mb-0.5">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground">{book.author}</p>
              </div>
              <div className="space-y-2">
                {book.links.map((link, j) => (
                  <DownloadLink
                    key={j}
                    href={`https://library.wikisubmission.org/file/${link.file}`}
                    label={link.label}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
