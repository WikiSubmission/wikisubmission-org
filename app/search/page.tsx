import SearchClient from "./search-client";
import { Metadata } from "next";

type Props = {
    searchParams: Promise<{ q?: string; type?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q, type } = await searchParams;

    let resolvedType = null;
    if (type) {
        resolvedType = type.charAt(0).toUpperCase() + type.slice(1);
    }

    if (q) {
        const title = `${q} | ${resolvedType || 'Search'} | WikiSubmission`;
        const description = `Search for "${q}" on WikiSubmission`;
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
        title: `${resolvedType || 'Search'} | WikiSubmission`,
        description: "Search for content on WikiSubmission",
        openGraph: {
            title: `${resolvedType || 'Search'} | WikiSubmission`,
            description: "Search for content on WikiSubmission",
        },
    };
}

export default function SearchPage() {
    return <SearchClient />;
}
