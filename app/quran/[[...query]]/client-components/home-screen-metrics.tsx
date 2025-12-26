"use client";

import { useQuranMetrics } from "@/hooks/use-quran-metrics";
import { HistoryIcon } from "lucide-react";

export default function HomeScreenMetrics() {
    const quranMetrics = useQuranMetrics();
    return (
        <main>
            {quranMetrics.lastQueryMetadata && (
                <a href={`/quran/${quranMetrics.lastChapter}`} className="hover:cursor-pointer text-xs">
                    <div className="bg-muted/50 px-4 py-2 rounded-2xl space-y-2 w-fit [&>*]:hover:text-violet-500">
                        <div className="flex items-center gap-2 ">
                            <HistoryIcon className="size-3" />
                            <p>
                                {quranMetrics.lastQueryMetadata?.formattedQuery}
                            </p>
                        </div>
                    </div>
                </a>
            )}
        </main>
    )
}