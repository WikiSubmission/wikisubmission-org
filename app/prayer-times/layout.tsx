import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Prayer Times | WikiSubmission",
    description: "Get accurate prayer times for any location, with customizable Asr calculation methods.",
    openGraph: {
        title: "Prayer Times | WikiSubmission",
        description: "Get accurate prayer times for any location, with customizable Asr calculation methods.",
    },
};

export default function PrayerTimesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
