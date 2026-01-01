import RamadanClient from './ramadan-client';
import { Metadata } from 'next';

type Props = {
    searchParams: Promise<{ q?: string; year?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q, year } = await searchParams;

    if (q) {
        const title = `${q} | Ramadan ${year || ''} | WikiSubmission`;
        const description = `Get the Ramadan ${year || ''} fasting schedule and moon data for ${q}`;
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
        title: "Ramadan Schedule | WikiSubmission",
        description: "Get the Ramadan fasting schedule and moon data for any location and year",
        openGraph: {
            title: "Ramadan Schedule | WikiSubmission",
            description: "Get the Ramadan fasting schedule and moon data for any location and year",
        },
    };
}

export default function Page() {
    return <RamadanClient />;
}
