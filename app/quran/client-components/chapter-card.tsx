import { SearchHitChapter } from "wikisubmission-sdk/lib/quran/v1/query-result";

export default function ChapterCard({ chapter }: { chapter: SearchHitChapter }) {
    return (
        <div className="bg-muted/50 p-4 rounded-2xl">
            <p>
                <strong>Sura {chapter.chapter_number}:</strong> {chapter.title_english} ({chapter.title_transliterated})
            </p>
        </div>
    )
}