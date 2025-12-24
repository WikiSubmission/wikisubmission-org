import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import SearchResult from "./client-components/search-result";
import HomeScreenRandomVerse from "./client-components/home-screen-random-verse";
import QuranUtilitiesRow from "./client-components/utilities-row";

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
        <main className="space-y-2 whitespace-pre-line">
            <QuranUtilitiesRow />
            <section className="space-y-2">
                {!queryText && (
                    <div>
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