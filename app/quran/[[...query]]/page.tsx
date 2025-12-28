import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import SearchResult from "./client-components/result-search";
import HomeScreenRandomVerse from "./mini-components/home-random-verse";
import HomeScreenMetrics from "./mini-components/home-metrics";
import QuranUtilitiesRow from "./mini-components/home-utilities";
import HomeScreenSuggestions from "./mini-components/home-suggestions";
import Image from "next/image";
import { ws } from "@/lib/wikisubmission-sdk";
import { Metadata } from "next";

export default async function QuranPage({ params, searchParams }: { params: Promise<{ query?: string[] }>, searchParams: Promise<{ q?: string }> }) {
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

export async function generateMetadata({ params, searchParams }: { params: Promise<{ query?: string[] }>, searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
    const { q } = await searchParams;
    const { query } = await params;
    const queryText = q || query?.join(" ");

    let title = `Quran | The Final Testament | WikiSubmission`;
    let description = `Access the Final Testament at WikiSubmission, a free and open-source platform for Submission.`;
    const openGraph = {
        images: [
            {
                url: "/brand-assets/logo-transparent.png",
                width: 125,
                height: 125,
            },
        ],
    };

    if (!queryText) {
        return {
            title,
            description,
            openGraph: {
                title,
                description,
                ...openGraph,
            },
        };
    }

    const parsedQuery = ws.Quran.Methods.parseQuery(queryText);

    if (parsedQuery.valid) {
        title = `${parsedQuery.metadata.title} | WikiSubmission`;

        description = (() => {
            if (parsedQuery.type === "chapter") {
                return `Read and study chapter ${parsedQuery.query} at WikiSubmission`
            }
            return `Explore Quran (The Final Testament) at WikiSubmission.`;
        })();

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                ...openGraph
            }
        }
    } else {
        return {
            title,
            description,
            openGraph: {
                title,
                description,
                ...openGraph
            }
        }
    }
}