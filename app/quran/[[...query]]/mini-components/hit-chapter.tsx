'use client';

import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import { highlightMarkdown } from "@/lib/highlight-markdown";
import { ChevronRight } from "lucide-react";
import { SearchHitChapter } from "wikisubmission-sdk/lib/quran/v1/query-result";

export default function HitChapter({ chapter }: { chapter: SearchHitChapter }) {
    const quranPreferences = useQuranPreferences();
    return (
        <a href={`/quran/${chapter.chapter_number}`}>
            <div className="flex items-center gap-1 bg-muted/50 p-4 rounded-2xl w-fit hover:bg-muted/80">
                <p>
                    <strong>Sura {chapter.chapter_number}:</strong> {highlightMarkdown(chapter[`title_${quranPreferences.primaryLanguage}`])} ({highlightMarkdown(chapter.title_transliterated)})
                </p>
                <ChevronRight className="size-4" />
            </div>
        </a>
    )
}