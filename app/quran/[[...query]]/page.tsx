import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import SearchResult from "./client-components/result-search";
import HomeScreenRandomVerse from "./mini-components/home-random-verse";
import HomeScreenMetrics from "./mini-components/home-metrics";
import QuranUtilitiesRow from "./mini-components/home-utilities";

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
                        <HomeScreenRandomVerse />
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