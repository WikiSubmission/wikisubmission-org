import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageSwitcher } from "@/components/page-switcher";
import { FaApple } from "react-icons/fa";

const LinkButton = ({ href, label }: { href: string; label: string }) => (
    <a
        href={href}
        target="_blank"
        className="block w-full px-4 py-2 rounded-lg border border-transparent hover:border-primary hover:bg-accent transition-colors flex items-center justify-between text-sm"
    >
        {label}
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </a>
);

export default function Resources() {
    return (
        <main className="space-y-6 p-8">
            <PageSwitcher currentPage="downloads" />
            <div className="flex flex-col items-center gap-4 mb-6">
                <Image
                    src="/brand-assets/logo-black.png"
                    alt="WikiSubmission Logo"
                    width={64}
                    height={64}
                    className="rounded-full"
                />
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">Downloads & Resources</h1>
                    <p className="text-sm text-muted-foreground">Free books and resources for Submission</p>
                </div>
            </div>

            {/* Main Resources */}
            <section className="flex flex-col gap-4">

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
                                <FaApple className="size-8" />
                                <ChevronRight className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                </section>


                <Item asChild variant="outline">
                    <Link href="#quran-final-testament">
                        <ItemContent>
                            <ItemTitle>Quran: The Final Testament</ItemTitle>
                            <ItemDescription>
                                Dr. Rashad Khalifa, Ph.D. - Multiple languages available
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Image
                                src="https://www.masjidtucson.org/images/catalog/bQuranCoverThumb.jpg"
                                alt="Quran Cover"
                                width={48}
                                height={48}
                                className="rounded-lg size-12"
                            />
                            <ChevronRight className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>

                <Item asChild variant="outline">
                    <Link href="#visual-presentation">
                        <ItemContent>
                            <ItemTitle>Visual Presentation of the Miracle</ItemTitle>
                            <ItemDescription>
                                Dr. Rashad Khalifa, Ph.D.
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Image
                                src="https://www.masjidtucson.org/images/catalog/quran_VP_thumb.png"
                                alt="Visual Presentation Cover"
                                width={48}
                                height={48}
                                className="rounded-lg size-12"
                            />
                            <ChevronRight className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>

                <Item asChild variant="outline">
                    <Link href="#quran-hadith-islam">
                        <ItemContent>
                            <ItemTitle>Quran, Hadith, and Islam</ItemTitle>
                            <ItemDescription>
                                Dr. Rashad Khalifa, Ph.D.
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Image
                                src="https://www.masjidtucson.org/images/catalog/QHICoverThumb.jpg"
                                alt="QHI Cover"
                                width={48}
                                height={48}
                                className="rounded-lg size-12"
                            />
                            <ChevronRight className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>

                <Item asChild variant="outline">
                    <Link href="#computer-speaks">
                        <ItemContent>
                            <ItemTitle>The Computer Speaks: God&apos;s Message to The World</ItemTitle>
                            <ItemDescription>
                                Dr. Rashad Khalifa, Ph.D.
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Image
                                src="https://www.masjidtucson.org/images/catalog/CompSpksCoverThumb.jpg"
                                alt="Computer Speaks Cover"
                                width={48}
                                height={48}
                                className="rounded-lg size-12"
                            />
                            <ChevronRight className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>

                <Item asChild variant="outline">
                    <Link href="#other-resources">
                        <ItemContent>
                            <ItemTitle>Other Resources</ItemTitle>
                            <ItemDescription>
                                Community contributions and mathematical research
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Image
                                src="/graphics/book.png"
                                alt="Book"
                                width={48}
                                height={48}
                                className="rounded-lg size-12"
                            />
                            <ChevronRight className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>
            </section>

            <Separator />

            {/* Quran: The Final Testament */}
            <section id="quran-final-testament" className="space-y-4">
                <div className="flex items-center gap-4">
                    <Image
                        src="https://www.masjidtucson.org/images/catalog/bQuranCoverThumb.jpg"
                        alt="Quran Cover"
                        width={80}
                        height={80}
                        className="rounded-lg w-20 shadow-sm"
                    />
                    <div>
                        <h3 className="text-2xl font-semibold">
                            Quran: The Final Testament
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Dr. Rashad Khalifa, Ph.D.
                        </p>
                    </div>
                </div>
                <Tabs defaultValue="full-pdf">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="full-pdf">Full PDF</TabsTrigger>
                        <TabsTrigger value="appendices">Appendices</TabsTrigger>
                        <TabsTrigger value="physical-copies">Physical Copies</TabsTrigger>
                    </TabsList>

                    <TabsContent value="full-pdf">
                        <Card>
                            <CardHeader>
                                <CardTitle>Full PDF</CardTitle>
                                <CardDescription>
                                    Original English Edition by{" "}
                                    <a href="/submission/rashad-khalifa">Dr. Rashad Khalifa</a>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    ["English", "quran-the-final-testament"],
                                    ["Turkish", "quran-the-final-testament-turkish"],
                                    ["French", "quran-the-final-testament-french"],
                                    ["Persian", "quran-the-final-testament-persian"],
                                    ["Tamil", "quran-the-final-testament-tamil"],
                                    ["Hindi", "quran-the-final-testament-hindi"],
                                    [
                                        "Arabic (with English)",
                                        "quran-the-final-testament-with-arabic",
                                    ],
                                ].map(([label, file], i) => (
                                    <LinkButton
                                        key={i}
                                        href={`https://library.wikisubmission.org/file/${file}`}
                                        label={label as string}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appendices">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appendices</CardTitle>
                                <CardDescription>
                                    From the original translation. See all{" "}
                                    <a href="/submission/appendices">38 appendices</a>.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    ["English", "quran-the-final-testament-appendices"],
                                    ["Turkish", "quran-the-final-testament-appendices-turkish"],
                                    ["French", "quran-the-final-testament-appendices-french"],
                                    ["Persian", "quran-the-final-testament-appendices-persian"],
                                    ["Tamil", "quran-the-final-testament-appendices-tamil"],
                                    ["Hindi", "quran-the-final-testament-appendices-hindi"],
                                ].map(([label, file], i) => (
                                    <LinkButton
                                        key={i}
                                        href={`https://library.wikisubmission.org/file/${file}`}
                                        label={label as string}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="physical-copies">
                        <Card>
                            <CardHeader>
                                <CardTitle>Physical Copies</CardTitle>
                                <CardDescription>Order from online retailers.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <LinkButton
                                    href="https://www.masjidtucson.org/publications/catalog/index.html"
                                    label="Masjid Tucson"
                                />
                                <LinkButton
                                    href="https://www.barnesandnoble.com/w/quran-the-final-testament-authorized-english-version-dr-rashad-khalifa/1008697516"
                                    label="Barnes & Noble"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </section>

            {/* Visual Presentation */}
            <section id="visual-presentation" className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Image
                        src="https://www.masjidtucson.org/images/catalog/quran_VP_thumb.png"
                        width={80}
                        height={80}
                        alt="Quran VP Cover"
                        className="rounded-lg w-20 shadow-sm"
                    />
                    <div>
                        <h3 className="text-2xl font-semibold">
                            Visual Presentation of the Miracle
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Dr. Rashad Khalifa, Ph.D.
                        </p>
                    </div>
                </div>
                <br />
                <a
                    href="https://library.wikisubmission.org/file/visual-presentation-of-the-miracle"
                    target="_blank"
                >
                    <Button variant="outline">Download PDF</Button>
                </a>
            </section>

            {/* QHI */}
            <section id="quran-hadith-islam" className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Image
                        src="https://www.masjidtucson.org/images/catalog/QHICoverThumb.jpg"
                        alt="QHI Cover"
                        width={80}
                        height={80}
                        className="rounded-lg w-20 shadow-sm"
                    />
                    <div>
                        <h3 className="text-2xl font-semibold">Quran, Hadith, and Islam</h3>
                        <p className="text-sm text-muted-foreground">
                            Dr. Rashad Khalifa, Ph.D.
                        </p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>PDF Versions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <LinkButton
                            href="https://library.wikisubmission.org/file/quran-hadith-and-islam-original"
                            label="Original PDF"
                        />
                        <LinkButton
                            href="https://library.wikisubmission.org/file/quran-hadith-and-islam"
                            label="Alternative Format"
                        />
                    </CardContent>
                </Card>
            </section>

            {/* The Computer Speaks */}
            <section id="computer-speaks" className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Image
                        src="https://www.masjidtucson.org/images/catalog/CompSpksCoverThumb.jpg"
                        alt="Computer Speaks Cover"
                        width={80}
                        height={80}
                        className="rounded-lg w-20 shadow-sm"
                    />
                    <div>
                        <h3 className="text-2xl font-semibold">
                            The Computer Speaks: God&apos;s Message to The World
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Dr. Rashad Khalifa, Ph.D.
                        </p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Original PDF</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <LinkButton
                            href="https://library.wikisubmission.org/file/the-computer-speaks"
                            label="Download PDF"
                        />
                    </CardContent>
                </Card>
            </section>

            {/* Other Resources */}
            <section id="other-resources" className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Image
                        src="/graphics/book.png"
                        alt="Book"
                        width={80}
                        height={80}
                        className="rounded-lg w-20 shadow-sm"
                    />
                    <div>
                        <h3 className="text-2xl font-semibold">Other Resources</h3>
                        <p className="text-sm text-muted-foreground">From the community</p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Beyond Probability – God&apos;s Message in Mathematics
                        </CardTitle>
                        <CardDescription>Abdula Arik</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <LinkButton
                            href="https://library.wikisubmission.org/file/beyond-probability"
                            label="Download PDF (Series I)"
                        />
                        <LinkButton
                            href="https://library.wikisubmission.org/file/beyond-probability-series-2"
                            label="Download PDF (Series II)"
                        />
                    </CardContent>

                    <Separator />

                    <CardHeader>
                        <CardTitle>The Math Miracle - Intended or Coincidence</CardTitle>
                        <CardDescription>Mike J.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <LinkButton
                            href="https://library.wikisubmission.org/file/math-miracle-intended-or-coincidence"
                            label="Download PDF"
                        />
                    </CardContent>

                    <Separator />

                    <CardHeader>
                        <CardTitle>Al-Quran The Ultimate Miracle</CardTitle>
                        <CardDescription>Ahmed Deedat</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <LinkButton
                            href="https://library.wikisubmission.org/file/ultimate-miracle-of-the-quran"
                            label="Download PDF"
                        />
                    </CardContent>

                    <Separator />

                    <CardHeader>
                        <CardTitle>
                            Nineteen: God&apos;s Signature in Nature and Scripture
                        </CardTitle>
                        <CardDescription>Edip Yuksel</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <LinkButton
                            href="https://library.wikisubmission.org/file/nineteen-gods-signature-in-nature-and-scripture"
                            label="Download PDF"
                        />
                    </CardContent>
                </Card>
            </section>
        </main>
    );
}
