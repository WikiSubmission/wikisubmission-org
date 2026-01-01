import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ramadan Schedule | WikiSubmission",
    description: "Get accurate Ramadan fasting schedules and prayer times for any location and year.",
    openGraph: {
        title: "Ramadan Schedule | WikiSubmission",
        description: "Get accurate Ramadan fasting schedules and prayer times for any location and year.",
    },
};

export default function RamadanLayout({ children }: { children: React.ReactNode }) {
    return children;
}
