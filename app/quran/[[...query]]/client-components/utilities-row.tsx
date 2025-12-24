import { ThemeToggle } from "@/components/toggles/theme-toggle";
import { Button } from "@/components/ui/button";
import { ws } from "@/lib/wikisubmission-sdk";
import { FileIcon, HomeIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";

export default async function QuranUtilitiesRow() {
    const randomVerse = await ws.Quran.randomVerse();
    return (
        <main className="p-4 dark:bg-black bg-white rounded-2xl space-y-2">
            <p className="text-xs text-muted-foreground tracking-wider">
                QURAN: THE FINAL TESTAMENT
            </p>
            <div className="flex flex-wrap items-center justify-between space-x-2">
                <section className="space-x-2">
                    <Link href="/quran">
                        <Button variant="secondary" size="sm">
                            <HomeIcon />
                            Home
                        </Button></Link>
                    <Link href={`/quran/${randomVerse.data ? `${randomVerse.data.chapter_number}?verse=${randomVerse.data.verse_number}` : `74?verse=30`}`}>
                        <Button variant="secondary" size="sm">
                            <SparkleIcon />
                            Random
                        </Button>
                    </Link>
                    <Link href="/downloads">
                        <Button variant="secondary" size="sm">
                            <FileIcon />
                            PDFs
                        </Button>
                    </Link>
                </section>
                <ThemeToggle />
            </div>
        </main>
    )
}