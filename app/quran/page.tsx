import { Metadata } from "next";
import SearchResult from "./client-components/search-result";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

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

export default function QuranPage() {
    return (
        <main className="space-y-4">
            <section className="space-y-2">
                <h2 className="text-2xl font-light text-muted-foreground tracking-widest">
                    THE FINAL TESTAMENT
                </h2>
            </section>
            <section>
                <Suspense fallback={<Spinner />}>
                    <SearchResult />
                </Suspense>
            </section>
        </main>
    );
}