import PrayerTimesClient from './prayer-times-client';
import { Metadata } from 'next';

type Props = {
    searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q } = await searchParams;

    if (q) {
        const title = `${q} | Prayer Times | WikiSubmission`;
        const description = `Get live prayer times information and daily schedule`;
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
        title: "Prayer Times | WikiSubmission",
        description: "Get live prayer times information and daily schedule for any location",
        openGraph: {
            title: "Prayer Times | WikiSubmission",
            description: "Get live prayer times information and daily schedule for any location.",
        },
    };
}

export default function Page() {
    return <PrayerTimesClient />;
}