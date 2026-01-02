import MediaClient from "./media-client";
import { Metadata } from "next";

type Props = {
    searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q } = await searchParams;

    if (q) {
        const title = `${q} | Media | WikiSubmission`;
        const description = `Search and browse media, newsletters and more for "${q}"`;
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
        title: "Media | WikiSubmission",
        description: "Search and browse media, newsletters and more",
        openGraph: {
            title: "Media | WikiSubmission",
            description: "Search and browse media, newsletters and more",
        },
    };
}

export default function MediaPage() {
    return <MediaClient />;
}
