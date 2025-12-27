import { ThemeToggle } from "@/components/toggles/theme-toggle";
import { Button } from "@/components/ui/button";
import { ws } from "@/lib/wikisubmission-sdk";
import { AppleIcon, DownloadIcon, FileIcon, HomeIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";
import { FaApple, FaAppleAlt, FaAppStore } from "react-icons/fa";

export default async function QuranUtilitiesRow() {
    const randomVerse = await ws.Quran.randomVerse();
    return (
        <main className="p-4 flex items-center justify-between dark:bg-black bg-white rounded-2xl space-x-4">
            <div className="flex-wrap">
                <p className="font-semibold text-xs text-muted-foreground tracking-wider">
                    QURAN: THE FINAL TESTAMENT
                </p>
                <p className="text-xs text-muted-foreground tracking-wider">
                    Rashad Khalifa, Ph.D.
                </p>
            </div>
            <div className="flex justify-end space-y-2 space-x-2">
                <Link href="/quran">
                    <Button variant="outline" size="icon">
                        <HomeIcon />
                    </Button>
                </Link>
                <Link href={`/quran/${randomVerse.data ? `${randomVerse.data.chapter_number}?verse=${randomVerse.data.verse_number}` : `74?verse=30`}`}>
                    <Button variant="outline" size="icon">
                        <SparkleIcon />
                    </Button>
                </Link>
                <Link href="/downloads">
                    <Button variant="outline" size="icon">
                        <DownloadIcon />
                    </Button>
                </Link>
                <ThemeToggle />
            </div>
        </main>
    )
}