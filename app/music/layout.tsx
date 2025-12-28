import { MusicProvider } from "@/lib/music-context";

export default function ZikrLayout({ children }: { children: React.ReactNode }) {
    return (
        <MusicProvider>
            {children}
        </MusicProvider>
    );
}