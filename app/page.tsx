import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { About } from "@/constants/about";
import Image from "next/image";
import Link from "next/link";
import { FaApple, FaDiscord, FaTwitter, FaYoutube, FaChevronRight, FaGithub } from "react-icons/fa";
import { PageSwitcher } from "@/components/page-switcher";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center text-center space-y-8 md:p-24 p-4">
      <PageSwitcher currentPage="home" />
      <Image
        src="/brand-assets/logo-black.png"
        alt="WikiSubmission Logo"
        width={72}
        height={72}
        className="rounded-full"
      />
      <section className="max-w-sm flex gap-4 max-w-md items-center">
        <h1 className="text-3xl font-semibold">
          WikiSubmission
        </h1>
      </section>

      <hr className="w-xs" />

      <section className="space-y-2 w-full max-w-xs">
        <section className="flex flex-col">
          <Item asChild variant="outline">
            <Link href="/quran">
              <ItemContent>
                <ItemTitle>
                  The Final Testament
                </ItemTitle>
                <ItemDescription>
                  Read on the Web
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Image src="/brand-assets/logo-transparent.png" className="size-6 rounded-full" alt="Quran" width={500} height={500} />
                <FaChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </section>

        <section className="flex flex-col">
          <Item asChild variant="outline">
            <Link href="https://apps.apple.com/us/app/submission-religion-of-god/id6444260632" target="_blank" rel="noopener noreferrer">
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

        <p className="text-sm text-violet-600 tracking-widest" >
          More coming soon.
        </p>
      </section>

      <hr className="w-xs" />

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
        <Link href="/contact">
          Contact
        </Link>
        <Link href="/legal/terms-of-use">
          Terms of Use
        </Link>
        <Link href="/legal/privacy-policy">
          Privacy Policy
        </Link>
        <Link href="/donate">
          Donate
        </Link>
      </section>

      <section className="max-w-sm text-center text-xs text-muted-foreground space-y-2">
        <p>
          WikiSubmission is a 501(c)(3) nonprofit organization.  We provide free and open-source technology, educational resources, and creative media.
        </p>
      </section>

      <section className="max-w-sm text-center text-xs text-muted-foreground tracking-widest font-mono">
        <Link href="https://wikisubmission.org">
          WIKISUBMISSION.ORG
        </Link>
      </section>
    </main>
  );
}

