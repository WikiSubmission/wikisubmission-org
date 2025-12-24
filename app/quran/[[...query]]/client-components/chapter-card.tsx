'use client';

import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import { highlightMarkdown } from "@/lib/highlight-markdown";
import { SearchHitChapter } from "wikisubmission-sdk/lib/quran/v1/query-result";

export default function ChapterCard({ chapter }: { chapter: SearchHitChapter }) {
    const quranPreferences = useQuranPreferences();
    return (
        <div className="bg-muted/50 p-4 rounded-2xl">
            <p>
                <strong>Sura {chapter.chapter_number}:</strong> {highlightMarkdown(chapter[`title_${quranPreferences.primaryLanguage}`])} ({highlightMarkdown(chapter.title_transliterated)})
            </p>
        </div>
    )
}