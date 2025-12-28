import type { Metadata } from "next";
import { MusicProvider } from "@/lib/music-context";

export const metadata: Metadata = {
    title: "Music (Zikr) | WikiSubmission",
    description: "Glorification and commemoration of God through beautiful recitations and melodies.",
    openGraph: {
        title: "Music (Zikr) | WikiSubmission",
        description: "Glorification and commemoration of God through beautiful recitations and melodies.",
    },
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
    return (
        <MusicProvider>
            {children}
        </MusicProvider>
    );
}