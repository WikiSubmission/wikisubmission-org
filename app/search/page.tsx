import SearchClient from "./search-client";
import { Metadata } from "next";

type Props = {
    searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q } = await searchParams;

    if (q) {
        const title = `${q} | Search | WikiSubmission`;
        const description = `Search and browse for "${q}" on WikiSubmission`;
        return {
            title,
            description,
            openGraph: {
                title,
                description,
            },
        };
    }

    return {
        title: "Search | WikiSubmission",
        description: "Search and browse for content on WikiSubmission",
        openGraph: {
            title: "Search | WikiSubmission",
            description: "Search and browse for content on WikiSubmission",
        },
    };
}

export default function SearchPage() {
    return <SearchClient />;
}
