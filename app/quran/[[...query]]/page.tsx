import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import SearchResult from "./client-components/result-search";
import HomeScreenRandomVerse from "./mini-components/home-random-verse";
import HomeScreenMetrics from "./mini-components/home-metrics";
import QuranUtilitiesRow from "./mini-components/home-utilities";
import HomeScreenSuggestions from "./mini-components/home-suggestions";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Quran - WikiSubmission",
    description: "Access the Final Testament at WikiSubmission",
    openGraph: {
        title: "Quran - WikiSubmission",
        description: "Access the Final Testament at WikiSubmission",
        url: "/quran",
        images: [
            {
                url: "/brand-assets/logo-black.png",
                width: 125,
                height: 125,
                alt: "WikiSubmission Logo",
            },
        ],
    },
}

export default async function QuranPage({ params, searchParams }: { params: { query: string[] }, searchParams: { q: string } }) {
    const { q } = await searchParams;
    const { query } = await params;

    const queryText = q || query?.join(" ");

    return (
        <main className="whitespace-pre-line">
            <section>
                {!queryText && (
                    <div className="space-y-2">
                        <QuranUtilitiesRow />
                        <HomeScreenMetrics />
                        <Image
                            src="/brand-assets/logo-transparent.png"
                            alt="WikiSubmission Logo"
                            width={125}
                            height={125}
                            className="mx-auto"
                        />
                        <hr className="my-6 w-xs mx-auto" />
                        <HomeScreenSuggestions />
                        <hr className="my-6 w-xs mx-auto" />
                        <HomeScreenRandomVerse />
                        <hr className="my-6 w-xs mx-auto" />
                    </div>
                )}
            </section>
            {queryText && (
                <section>
                    <Suspense fallback={<Spinner />}>
                        <SearchResult props={{ query: queryText }} />
                    </Suspense>
                </section>
            )}
        </main>
    );
}