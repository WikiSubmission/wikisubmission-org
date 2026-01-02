import MediaClient from "./media-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Media | WikiSubmission",
    description: "Search and browse WikiSubmission media and newsletters",
    openGraph: {
        title: "Media | WikiSubmission",
        description: "Search and browse WikiSubmission media and newsletters",
    },
};

export default function MediaPage() {
    return <MediaClient />;
}
