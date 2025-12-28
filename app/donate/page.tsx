import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item";
import { ChevronRight, Heart, Calendar, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { About } from "@/constants/about";

export default function DonatePage() {
    return (
        <main className="flex flex-col min-h-screen items-center justify-center text-center space-y-4 md:p-24 p-8">
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
                <h1 className="text-3xl font-semibold">
                    Support WikiSubmission
                </h1>
            </section>

            <section className="max-w-sm flex flex-col gap-4 w-full">
                <Item asChild variant="outline">
                    <Link href="https://donate.stripe.com/dRmeV6bVIeic9Xt9KfeAg00" target="_blank" rel="noopener noreferrer">
                        <ItemContent>
                            <ItemTitle>
                                One-Time Contribution
                            </ItemTitle>
                            <ItemDescription>
                                Make a single contribution
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Heart className="size-5" />
                            <ChevronRight className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>

                <Item asChild variant="outline">
                    <Link href="https://donate.stripe.com/4gMeV69NAde86Lhe0veAg03" target="_blank" rel="noopener noreferrer">
                        <ItemContent>
                            <ItemTitle>
                                Monthly Contribution
                            </ItemTitle>
                            <ItemDescription>
                                Choose an amount to contribute every month
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Calendar className="size-5" />
                            <ChevronRight className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>
            </section>

            <section className="max-w-sm text-center text-sm text-muted-foreground space-y-3">
                <p>
                    Your donations directly support our cause. All funds are used to maintain our infrastructure and operations and to fund new technical and creative initiatives in the cause of God. Donations do not purchase, unlock, or provide any in‑app features or content.
                </p>
            </section>

            <section className="max-w-sm text-center text-sm text-muted-foreground space-y-3">
                <p>
                    We use Stripe to securely process your donations. Alternatively, you can send donations via PayPal or Zelle by directing them to the following email address: <span className="font-medium text-violet-600">finance@wikisubmission.org</span>.
                </p>
            </section>

            <section className="max-w-sm text-center text-sm text-muted-foreground space-y-3 ">
                <p>
                    WikiSubmission is a registered 501(c)(3) public charity (EIN: 39-4876245). Contributions from U.S. donors may be tax-deductible to the extent permitted by law. Please consult your tax advisor and the IRS for guidance.
                </p>
            </section>

            <section className="max-w-sm text-center text-sm text-muted-foreground space-y-3">
                <p>
                    For any questions, please write to <a href={`mailto:${About.email}`} className="text-violet-600 hover:cursor-pointer hover:underline">{About.email}</a>.
                </p>
            </section>

            <section className="max-w-sm text-center italic text-sm text-muted-foreground border-y border-muted-foreground/20 py-4">
                <p>
                    <strong>[2:261]</strong> The example of those who spend their monies in the cause of GOD is that of a grain that produces seven spikes, with a hundred grains in each spike. GOD multiplies this manifold for whomever He wills. GOD is Bounteous, Knower.
                </p>
            </section>

            <section>
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-violet-600">
                    <ChevronLeft className="size-4" />
                    <p className="text-sm">
                        Back to Home
                    </p>
                </Link>
            </section>
        </main>
    );
}
