import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'
import { About } from '@/constants/about'
import {
  ChevronRight,
  Mail,
  Github,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center text-center space-y-8 md:p-24 p-4">
      <Link href="/">
        <Image
          src="/brand-assets/logo-transparent.png"
          alt="WikiSubmission Logo"
          width={72}
          height={72}
          className="rounded-full"
        />
      </Link>

      <section className="max-w-sm flex gap-4 max-w-md items-center">
        <h1 className="text-3xl font-semibold">Contact Us</h1>
      </section>

      <section className="max-w-sm text-center text-sm text-muted-foreground">
        <p>
          We&apos;d love to hear from you. Whether you have questions,
          suggestions, or need support, we&apos;re here to help.
        </p>
      </section>

      <hr className="w-xs" />

      <section className="max-w-sm flex flex-col gap-4">
        <Item asChild variant="outline">
          <a href={`mailto:${About.email}`}>
            <ItemContent>
              <ItemTitle>Email</ItemTitle>
              <ItemDescription>General inquiries and support</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Mail className="size-4" />
              <ChevronRight className="size-4" />
            </ItemActions>
          </a>
        </Item>

        <Item asChild variant="outline">
          <Link
            href={About.social.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ItemContent>
              <ItemTitle>GitHub</ItemTitle>
              <ItemDescription>Bug reports and contributions</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Github className="size-4" />
              <ChevronRight className="size-4" />
            </ItemActions>
          </Link>
        </Item>

        <Item asChild variant="outline">
          <Link
            href={About.social.discord}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ItemContent>
              <ItemTitle>Discord</ItemTitle>
              <ItemDescription>Chat with us</ItemDescription>
            </ItemContent>
            <ItemActions>
              <MessageSquare className="size-4" />
              <ChevronRight className="size-4" />
            </ItemActions>
          </Link>
        </Item>
      </section>

      <section>
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-violet-600"
        >
          <ChevronLeft className="size-4" />
          <p className="text-sm">Back to Home</p>
        </Link>
      </section>
    </main>
  )
}
