import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { About } from "@/constants/about";
import { FaApple, FaDiscord, FaTwitter, FaYoutube, FaChevronRight, FaGithub, FaHeart, FaEnvelope } from "react-icons/fa";
import { DownloadIcon, HeartIcon, Music2Icon, MoonIcon } from "lucide-react";
import { PageSwitcher } from "@/components/page-switcher";
import { ThemeToggle } from "@/components/toggles/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center text-center space-y-8 md:p-24 p-4">
      <div className="flex justify-between items-center gap-2">
        <PageSwitcher currentPage="home" />
        <ThemeToggle />
      </div>
      <Image
        src="/brand-assets/logo-transparent.png"
        alt="WikiSubmission Logo"
        width={72}
        height={72}
        className="rounded-full"
      />
      <section className="max-w-sm flex flex-col gap-4 max-w-md items-center">
        <h1 className="text-3xl font-semibold">
          WikiSubmission
        </h1>
      </section>

      <section className="space-y-2 w-full max-w-xs">
        <section className="flex flex-col">
          <Item asChild variant="outline">
            <Link href="/quran">
              <ItemContent>
                <ItemTitle>
                  Final Testament
                </ItemTitle>
                <ItemDescription>
                  Read on the Web
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Image src="/brand-assets/logo-transparent.png" className="size-6 rounded-full" alt="Quran: The Final Testament" width={500} height={500} />
                <FaChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </section>

        <section className="space-y-2 w-full max-w-xs">
          <section className="flex flex-col">
            <Item asChild variant="outline">
              <Link href="/bible" className="opacity-50 cursor-not-allowed">
                <ItemContent>
                  <ItemTitle>
                    The Bible
                  </ItemTitle>
                  <ItemDescription>
                    Coming Soon
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Image src="/brand-assets/logo-transparent.png" className="size-6 rounded-full" alt="Quran: The Final Testament" width={500} height={500} />
                  <FaChevronRight className="size-4" />
                </ItemActions>
              </Link>
            </Item>
          </section>
        </section>

        <section className="flex flex-col">
          <Item asChild variant="outline">
            <Link href="/music">
              <ItemContent>
                <ItemTitle>
                  Music
                </ItemTitle>
                <ItemDescription>
                  Glorification and melodies
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Music2Icon className="size-6" />
                <FaChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </section>

        <section className="flex flex-col">
          <Item asChild variant="outline">
            <Link href="/prayer-times">
              <ItemContent>
                <ItemTitle>
                  Prayer Times
                </ItemTitle>
                <ItemDescription>
                  Accurate daily timings
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <HeartIcon className="size-6" />
                <FaChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </section>

        <section className="flex flex-col">
          <Item asChild variant="outline">
            <Link href="/ramadan">
              <ItemContent>
                <ItemTitle>
                  Ramadan
                </ItemTitle>
                <ItemDescription>
                  Fasting schedule
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <MoonIcon className="size-6" />
                <FaChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </section>

        <section className="flex flex-col">
          <Item asChild variant="outline">
            <Link href="https://apps.apple.com/app/id6444260632" target="_blank" rel="noopener noreferrer">
              <ItemContent>
                <ItemTitle>
                  iOS App
                </ItemTitle>
                <ItemDescription>
                  iPhone, iPad and Mac
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <FaApple className="size-6" />
                <FaChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </section>

        <section className="flex flex-col">
          <Item asChild variant="outline">
            <Link href="/downloads">
              <ItemContent>
                <ItemTitle>
                  Downloads
                </ItemTitle>
                <ItemDescription>
                  Free resources & PDFs
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <DownloadIcon className="size-6" />
                <FaChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </section>

        <section className="flex flex-col">
          <Item asChild variant="outline">
            <Link href="https://discord.com/oauth2/authorize?client_id=978658099474890793&permissions=274877925376&integration_type=0&scope=bot" target="_blank" rel="noopener noreferrer">
              <ItemContent>
                <ItemTitle>
                  Discord Bot
                </ItemTitle>
                <ItemDescription>
                  Add to your server
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <FaDiscord className="size-6" />
                <FaChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </section>
      </section>

      <section className="max-w-xs md:max-w-sm text-center text-xs text-muted-foreground space-y-2">
        <div className="bg-muted/50 p-2 rounded-md">
          <Image src="/brand-assets/logo-transparent.png" className="mx-auto mb-2 size-6 rounded-full" alt="Quran: The Final Testament" width={500} height={500} />
          <div className="flex flex-col space-y-2">
            <p>
              WikiSubmission is a faith-based 501(c)(3) nonprofit organization providing free and open-source tools and technology, educational resources, and creative media.
            </p>
            <p>
              We believe that all religions share a common foundation in the worship of God and the submission to God alone. By focusing on this central truth, we aim to promote universal unity and to bridge the gap between all world religions.
            </p>
            <p className="italic">
              &quot;Anyone who submits to God and devotes the worship to God ALONE is a Submitter. One may be a Jewish Submitter, a Christian Submitter, a Buddhist Submitter, a Hindu Submitter, or a Muslim Submitter.&quot;
            </p>

            <p className="italic">
              &quot;Submission is the religion whereby we recognize God&apos;s absolute authority, and reach an unshakeable conviction that God <i>alone</i> possesses all power; no other entity possesses any power that is independent of Him.&quot; (Deuteronomy 6:4-5, Luke 12:29-30, Quran 3:18)
            </p>

            <p>
              <Link href={`https://library.wikisubmission.org/file/quran-the-final-testament`} target="_blank" rel="noopener noreferrer" className="underline">Learn more</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-4 [&>section]:text-center [&>section]:justify-center">
        <section className="flex flex-wrap gap-2 text-xs text-muted-foreground [&>a]:hover:text-violet-600">
          <Link href="/contact" className="flex items-center gap-2">
            <FaEnvelope className="size-3" />
            Contact
          </Link>
        </section>

        <section className="flex flex-wrap gap-2 text-xs text-muted-foreground [&>a]:hover:text-violet-600">
          <Link href="/donate" className="flex items-center gap-2">
            <FaHeart className="size-3" />
            Donate
          </Link>
        </section>
      </section>

      <section className="max-w-md flex flex-wrap gap-4 [&>a]:hover:text-violet-600">
        <Link href={About.social.github}>
          <FaGithub className="size-4" />
        </Link>
        <Link href={About.social.twitter}>
          <FaTwitter className="size-4" />
        </Link>
        <Link href={About.social.youtube}>
          <FaYoutube className="size-4" />
        </Link>
        <Link href={About.social.discord}>
          <FaDiscord className="size-4" />
        </Link>
      </section>


      <section className="flex flex-wrap gap-2 text-xs text-muted-foreground [&>a]:hover:text-violet-600">
        <Link href="/legal/terms-of-use">
          Terms of Use
        </Link>
        <Link href="/legal/privacy-policy">
          Privacy Policy
        </Link>
      </section>

      <section className="max-w-sm text-center text-xs text-muted-foreground tracking-widest font-mono">
        <Link href="https://wikisubmission.org">
          WIKISUBMISSION.ORG
        </Link>
      </section>
    </main>
  );
}

