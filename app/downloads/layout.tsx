import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Downloads & Resources | WikiSubmission",
    description: "Free books, research papers, and resources for Submission, including Quran: The Final Testament.",
    openGraph: {
        title: "Downloads & Resources | WikiSubmission",
        description: "Free books, research papers, and resources for Submission, including Quran: The Final Testament.",
    },
};

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
